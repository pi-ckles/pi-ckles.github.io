# Pi-ckles en ligne — mode d’emploi

Ce dossier contient tout ce qu’il faut pour mettre Pi-ckles en ligne gratuitement :

- `index.html` : le jeu complet (c’est `pickles.html`, renommé pour le site) ;
- `sons/` : les effets et les musiques, déjà mixés à un volume homogène ;
- `relais/` : le petit serveur qui relie le tableau, la télécommande et les tablettes ;
- `.nojekyll` : un fichier vide qui demande à GitHub de servir les fichiers tels quels.

Deux services gratuits, sans carte bancaire :

| Rôle | Service | Ce qu’il héberge |
| --- | --- | --- |
| Le site | GitHub Pages | `index.html` et `sons/` |
| Le relais | Render (Web Service gratuit) | le dossier `relais/` |

## 1. Mettre le site sur GitHub (10 minutes)

1. Crée un compte sur github.com.
2. Bouton **New repository** : nom `pickles`, visibilité **Public** (GitHub Pages est gratuit pour les dépôts publics), puis **Create repository**.
3. Sur la page du dépôt : **uploading an existing file**, puis glisse-dépose le **contenu** de ce dossier (`index.html`, `.nojekyll`, `LISEZMOI.md`, et les dossiers `sons` et `relais`). Valide avec **Commit changes**.
   Le fichier `.nojekyll` est invisible sur certains ordinateurs : s’il n’apparaît pas, crée-le directement sur GitHub (**Add file → Create new file**, nom `.nojekyll`, contenu vide).
4. **Settings → Pages** : Source **Deploy from a branch**, branche **main**, dossier **/ (root)**, **Save**.
5. Une minute plus tard, le jeu est en ligne à l’adresse `https://TON-PSEUDO.github.io/pickles/`.

## 2. Mettre le relais sur Render (10 minutes)

1. Crée un compte sur render.com en choisissant **Sign in with GitHub**.
2. **New → Web Service**, puis choisis le dépôt `pickles`.
3. Réglages :
   - **Name** : `pickles-relais` (ou ce que tu veux) ;
   - **Region** : **Frankfurt (EU Central)**, pour que les pseudos des élèves restent en Europe ;
   - **Root Directory** : `relais` ;
   - **Build Command** : `npm install` ;
   - **Start Command** : `npm start` ;
   - **Instance Type** : **Free**.
4. **Create Web Service**. Au bout de deux minutes, Render affiche une adresse du type `https://pickles-relais.onrender.com`. En l’ouvrant, tu dois lire « Relais Pi-ckles : OK ».

## 3. Relier le jeu au relais (2 minutes)

1. Sur GitHub, ouvre `index.html`, puis le crayon ✏️ (**Edit this file**).
2. Cherche (Ctrl + F) la ligne :
   `const RELAIS_PUBLIC = "";`
3. Mets l’adresse du relais entre les guillemets, en remplaçant `https` par `wss` :
   `const RELAIS_PUBLIC = "wss://pickles-relais.onrender.com";`
4. **Commit changes**. Le site se met à jour en une minute.

C’est tout : le tableau, la télécommande et les tablettes passent alors par le relais, depuis n’importe quel réseau (Wi-Fi du collège, 4G…).

## En classe

- Ouvre `https://TON-PSEUDO.github.io/pickles/` sur l’ordinateur du tableau.
- Le relais gratuit **s’endort après 15 minutes sans activité**. Le tableau le réveille dès son ouverture : compte jusqu’à une minute. Pendant ce temps, Réglages affiche « ⏳ Réveil du relais en ligne… », puis « Relais connecté ». Ouvre donc Pi-ckles une minute avant de lancer la partie.
- Pendant une partie, la télécommande et les tablettes échangent des messages toutes les quelques secondes : le relais reste éveillé.
- Les QR codes de la télécommande et de la salle des élèves contiennent l’adresse du relais : rien à régler sur les téléphones ni sur les tablettes.

## Mettre à jour le jeu plus tard

Sur GitHub, ouvre `index.html` → **⋯ → Upload files**, glisse la nouvelle version (renommée `index.html`) et valide. Pense à remettre ta ligne `RELAIS_PUBLIC` si la nouvelle version ne l’a pas.

## À vérifier avec le service informatique

- Que le réseau de l’établissement laisse passer les connexions **wss://** vers `onrender.com` (port 443, comme un site web ordinaire).
- Que `github.io` n’est pas filtré.

## Bon à savoir

- Le relais ne stocke rien : il transmet les messages et oublie tout dès que la salle se vide. Les scores, les snacks et l’historique restent sur l’ordinateur du tableau.
- Le dépôt est public : tout le monde peut voir et télécharger le jeu, ce qui est cohérent avec sa licence CC BY-NC-SA 4.0. Les sons de Pixabay et de Free-loops restent sous leurs propres licences, comme le précisent les conditions d’utilisation du jeu.
- Le jeu fonctionne toujours hors ligne, sur le réseau local, comme avant (`npx serve` et `node pickles-relais.js`).
