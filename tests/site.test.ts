import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { GAMES } from "@/lib/games";

const root = fileURLToPath(new URL("../", import.meta.url));

/** Every file under a folder (skipping build output). */
function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = `${dir}/${f}`;
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("the arcade", () => {
  it("has a link or a folder with an index.html for every listed game, using /o-games paths", () => {
    for (const g of GAMES) {
      expect(g.slug).toMatch(/^[a-z0-9-]+$/);
      expect(["api", "create"]).not.toContain(g.slug);
      if (g.url) {
        // Hosted somewhere else: a full https address, and no folder here to clash with it.
        expect(g.url).toMatch(/^https:\/\/[^\s]+$/);
        expect(existsSync(`${root}public/${g.slug}`)).toBe(false);
        continue;
      }
      const file = `${root}public/${g.slug}/index.html`;
      expect(existsSync(file)).toBe(true);
      const html = readFileSync(file, "utf8");
      // Games are served at /o-games/<slug> (no trailing slash), so asset links must be absolute.
      for (const src of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) expect(src[1]).toMatch(new RegExp(`^/o-games/${g.slug}/`));
    }
  });

  it("never shows a first name in anything the public can load", () => {
    const files = [...walk(`${root}public`), ...walk(`${root}app`), ...walk(`${root}lib`)];
    expect(files.length).toBeGreaterThan(5);
    // Names are written backwards here so this file doesn't contain them either.
    const names = ["revilO", "nagoL"].map((n) => n.split("").reverse().join(""));
    for (const f of files) for (const n of names) expect(readFileSync(f, "utf8"), f).not.toMatch(new RegExp(n, "i"));
  });
});
