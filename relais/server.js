// Pi-ckles · relais en ligne (tableau, télécommande, tablettes)
// Transmet les messages entre les appareils d’une même salle. Ne stocke rien.
// Hébergement gratuit : Render (Web Service, Node). Render fournit l’adresse https/wss et la variable PORT.
const http = require("http");
const { WebSocketServer } = require("ws");
const PORT = process.env.PORT || 8080;
const salles = new Map(); // code de salle -> ensemble de connexions

// Une simple page « OK » : elle sert au réveil du relais (le tableau l’appelle en s’ouvrant) et aux vérifications de Render.
const serveur = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
  res.end(`Relais Pi-ckles : OK (${salles.size} salle${salles.size > 1 ? "s" : ""} ouverte${salles.size > 1 ? "s" : ""})`);
});
const wss = new WebSocketServer({ server: serveur, maxPayload: 512 * 1024 });

wss.on("connection", (ws, req) => {
  const salle = (new URL(req.url, "http://x").searchParams.get("salle") || "").toUpperCase();
  if (!/^[A-Z0-9]{4,6}$/.test(salle)) { ws.close(1008, "salle invalide"); return; }
  if (!salles.has(salle)) salles.set(salle, new Set());
  const membres = salles.get(salle);
  if (membres.size >= 45) { ws.close(1008, "salle pleine"); return; }
  membres.add(ws); ws.vivant = true;
  ws.on("pong", () => { ws.vivant = true; });
  ws.on("message", (data) => { for (const autre of membres) if (autre !== ws && autre.readyState === 1) autre.send(data.toString()); });
  ws.on("close", () => { membres.delete(ws); if (!membres.size) salles.delete(salle); });
});

// toutes les 30 s : on écarte les connexions mortes (téléphone en veille, Wi-Fi coupé…)
setInterval(() => wss.clients.forEach((ws) => { if (!ws.vivant) return ws.terminate(); ws.vivant = false; ws.ping(); }), 30000);

serveur.listen(PORT, () => console.log(`Relais Pi-ckles prêt sur le port ${PORT}`));
