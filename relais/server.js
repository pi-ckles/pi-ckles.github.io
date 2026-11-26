// Relais en ligne commun à Pi-ckles et MoonLAN (tableau, télécommande, tablettes)
// Transmet les messages entre les appareils d’une même salle. Ne stocke rien.
// Hébergement gratuit : Render (Web Service, Node). Render fournit l’adresse https/wss et la variable PORT.
//
// v2 (MoonLAN) — rétrocompatible avec Pi-ckles :
//   · un appareil peut se présenter avec ?id=... dans l’adresse (ex. ?salle=4K7Q&id=J07) ;
//   · un message JSON qui contient "to" (un id ou une liste d’id) ne part qu’à ces appareils ;
//   · tout autre message part, comme avant, à tous les autres appareils de la salle.
//   · plafond relevé à 100 connexions par salle (60 joueurs + télécommande + écran, avec de la marge pour les reconnexions).
const http = require("http");
const { WebSocketServer } = require("ws");
const PORT = process.env.PORT || 8080;
const MAX_PAR_SALLE = 100;
const salles = new Map(); // code de salle -> ensemble de connexions

// Une simple page « OK » : elle sert au réveil du relais (le tableau l’appelle en s’ouvrant) et aux vérifications de Render.
const serveur = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
  res.end(`Relais Pi-ckles : OK (${salles.size} salle${salles.size > 1 ? "s" : ""} ouverte${salles.size > 1 ? "s" : ""})`);
});
const wss = new WebSocketServer({ server: serveur, maxPayload: 512 * 1024 });

// destinataires d’un message : null = tout le monde ; sinon un ensemble d’id
function destinataires(texte) {
  if (texte.charCodeAt(0) !== 123 || texte.indexOf('"to"') < 0) return null; // pas un objet JSON ciblé : diffusion
  try {
    const m = JSON.parse(texte);
    if (m && m.to != null) return new Set([].concat(m.to).map(String));
  } catch (e) { /* message non JSON : diffusion */ }
  return null;
}

wss.on("connection", (ws, req) => {
  const params = new URL(req.url, "http://x").searchParams;
  const salle = (params.get("salle") || "").toUpperCase();
  if (!/^[A-Z0-9]{4,6}$/.test(salle)) { ws.close(1008, "salle invalide"); return; }
  const id = params.get("id");
  ws.idAppareil = id && /^[A-Za-z0-9_-]{1,32}$/.test(id) ? id : null;
  if (!salles.has(salle)) salles.set(salle, new Set());
  const membres = salles.get(salle);
  if (membres.size >= MAX_PAR_SALLE) { ws.close(1008, "salle pleine"); return; }
  membres.add(ws); ws.vivant = true;
  ws.on("pong", () => { ws.vivant = true; });
  ws.on("message", (data) => {
    const texte = data.toString();
    const cibles = destinataires(texte);
    for (const autre of membres) {
      if (autre === ws || autre.readyState !== 1) continue;
      if (cibles && !(autre.idAppareil && cibles.has(autre.idAppareil))) continue;
      autre.send(texte);
    }
  });
  ws.on("close", () => { membres.delete(ws); if (!membres.size) salles.delete(salle); });
});

// toutes les 30 s : on écarte les connexions mortes (téléphone en veille, Wi-Fi coupé…)
setInterval(() => wss.clients.forEach((ws) => { if (!ws.vivant) return ws.terminate(); ws.vivant = false; ws.ping(); }), 30000);

serveur.listen(PORT, () => console.log(`Relais prêt sur le port ${PORT}`));
