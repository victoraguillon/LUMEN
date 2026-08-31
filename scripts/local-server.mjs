// LUMEN · Servidor local del stack de push (Node.js).
// Uso:  npm run dev   (levanta http://localhost:8787/api/send-push)
// Las variables salen de un archivo .env en la raíz (mismas que en Vercel).
// Se llaman igual que el endpooint de producción, para probar todo antes de subir.

import "dotenv/config";
import http from "node:http";
import handler from "../api/send-push.mjs";

const PORT = process.env.PORT || 8787;

const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    req.body = raw ? raw : undefined;
    handler(req, res);
  });
});

server.listen(PORT, () => {
  console.log(`send-push (Node/web-push) escuchando en http://localhost:${PORT}/api/send-push`);
});