// Fonts are copied verbatim rather than run through Vite: the woff2 keeps a
// stable filename and fonts.css keeps its relative url(), so the published
// path @tomcoggia/ui/fonts.css resolves without asset hashing.
import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/fonts", { recursive: true });
await cp("src/fonts", "dist/fonts", { recursive: true });
console.log("copied src/fonts -> dist/fonts");
