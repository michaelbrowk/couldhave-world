import { writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

// Coin-with-ring mark. `bg` fills the field (used for the opaque Apple icon);
// omit it for the transparent browser icon.
const coin = (bg?: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  ${bg ? `<rect width="32" height="32" fill="${bg}"/>` : ""}
  <circle cx="16" cy="16" r="13" fill="#b91c1c"/>
  <circle cx="16" cy="16" r="6" fill="none" stroke="${bg ?? "#fafaf8"}" stroke-width="3"/>
</svg>`;

function render(svg: string, size: number, out: string) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(out, png);
  console.log(`wrote ${out} (${size}px, ${png.length} bytes)`);
}

render(coin(), 192, "app/icon.png"); // transparent — modern browsers
render(coin("#fafaf8"), 180, "app/apple-icon.png"); // opaque cream — iOS home screen
