import { serwist } from "@serwist/next/config";

export default serwist({
  swSrc: "src/app/sw.ts",       // verifica los nombres de opciones en la doc
  swDest: "public/sw.js",
});