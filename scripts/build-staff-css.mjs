import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const input = "uis/staff/staff.input.css";
const output = "uis/staff/staff.css";

const result = await postcss([tailwindcss()]).process(await readFile(input, "utf8"), { from: input });
await writeFile(output, result.css);
console.log(`${output} generado (${result.css.length} bytes)`);
