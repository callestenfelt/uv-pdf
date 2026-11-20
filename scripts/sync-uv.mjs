import { cpSync, rmSync, mkdirSync } from "node:fs";
const src = "node_modules/universalviewer/dist";
const dst = "public/uv";
rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });
cpSync(`${src}/umd`, `${dst}/umd`, { recursive: true });
cpSync(`${src}/uv.css`, `${dst}/uv.css`);
console.log("UV copied to", dst);
