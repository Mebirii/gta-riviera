# GTA RIVIERA — V2 CINÉMATIQUE

Adaptation interactive originale de la campagne de JDR GTA Riviera, en français.

## 1. Jouer immédiatement (sans installer de serveur)

Ouvre **GTA_Riviera.html** dans Chrome, Safari, Firefox ou Edge. Les illustrations sont intégrées au fichier : il fonctionne seul, même sans dossier `assets`.

- **Solo** : dirige les quatre personnages, lance des D20 et prends des décisions qui influencent les missions suivantes.
- **Coopération locale** : 2 à 4 joueurs sur **le même écran** ; votes à tour de rôle, puis résolution par majorité.
- **Sauvegardes** : l'état de la campagne est conservé automatiquement dans le navigateur.

### Missions V2

1. **La Seconde Moitié** : retrouver Nérée après l'affaire du Belladone.
2. **Les Dettes de Lucien** : résoudre une collecte de fonds liée à des virements secrets.
3. **Le Convoi Nocturne** : intercepter un camion et découvrir ce qu'il transporte.
4. **Nuit Blanche** : infiltrer la villa Bellini ; à débloquer après la première mission terminée.

Le passage d'une mission à la suivante **conserve les statistiques, preuves, relations et conséquences**. Les missions secondaires disposent chacune de plusieurs conclusions. Le choix des personnages et les jets de D20 modifient les résultats.

## 2. Héberger une partie sur un ordinateur (2 à 4 appareils)

**Prerequis : Node.js LTS** (18+), disponible sur https://nodejs.org/fr.

- Sur **Mac** : double-clique `start_mac.command` (si macOS le bloque, clic droit → Ouvrir).
- Sur **Windows** : double-clique `start_windows.bat`.
- Sur **Linux** : exécute `./start_linux.sh`.
- Ou dans un terminal, depuis le dossier : `npm start` (ou `node server.js`).

Le navigateur s'ouvre sur **http://localhost:3000** sur l'ordinateur hôte. Sur les téléphones ou ordinateurs connectés au **même réseau Wi-Fi**, ouvre `http://ADRESSE_IP_LOCALE_HOTE:3000` (ex. `http://192.168.1.50:3000`). L'ordinateur hôte doit rester allumé, fenêtre du serveur ouverte. Le pare-feu doit autoriser Node.js sur le réseau privé.

**Dans le jeu** : choisir Multijoueur en ligne → Créer un salon. Partager le lien d'invitation avec les autres joueurs ; ils doivent tous utiliser l'URL du serveur (en local, l'IP locale, et non `localhost` sur leur propre appareil). Les 4 personnages sont exclusifs. Dès 2 joueurs connectés, l'hôte lance la mission et valide les décisions à la majorité ; en cas d'égalité, son vote départage.

**Reconnexion** : si le navigateur se ferme ou le Wi-Fi coupe, rouvrir le lien original sur le même navigateur. La session est enregistrée localement et tentera de se reconnecter. En cas de déconnexion de l'hôte, un joueur encore connecté devient hôte. Les salons inactifs expirent après deux heures. La progression **en ligne est conservée seulement en mémoire du serveur** : si le serveur redémarre, les salons et leur progression sont perdus. En solo/local, la sauvegarde reste dans le navigateur.

### Vérifier le serveur

Ouvrir `http://localhost:3000/health` : doit répondre avec `"ok":true`.

## 3. Rendre le jeu accessible depuis Internet

Le serveur du pack est **prêt à être déployé**, mais il **n'est pas publié sur Internet** par le simple téléchargement du ZIP. Pour créer une adresse permanente (ex. `https://gta-riviera.onrender.com`) :

1. Mettre **tout le contenu du dossier** dans un dépôt GitHub, avec `package.json`, `server.js`, `wire.js`, `engine.js`, `GTA_Riviera.html`, `assets/` et `render.yaml` à la racine.
2. Sur https://dashboard.render.com/, créer un **Web Service**, connecter ce dépôt GitHub (ou importer `render.yaml` via Blueprint si disponible).
3. Indiquer **Build** : `npm install --omit=dev` et **Start** : `npm start` ; port transmis automatiquement via `PORT`.
4. Une fois déployé, ouvrir l'URL HTTPS fournie par Render et créer un salon. Tous les joueurs accèdent au **même site public**.

Le plan gratuit, lorsqu'il est disponible, peut s'endormir et interrompre les WebSockets. Pour les sessions régulières, choisir un hébergement avec serveur Node persistant et **une seule instance**. Si un déploiement doit supporter plusieurs instances ou des sauvegardes durables, ajouter un stockage partagé (Redis/PostgreSQL) et des sessions persistantes.

**Vercel** : les WebSockets y sont pris en charge depuis 2026, mais les fonctions peuvent être réparties sur plusieurs instances ; notre architecture utilise des salons en mémoire locale et doit être adaptée à une base de données partagée avant d'être fiablement hébergée sur Vercel.

## 4. Sources techniques et tests

- `GTA_Riviera.html` : version autonome avec images embarquées.
- `assets/*.webp` : illustrations et extraits artistiques générés pour le jeu.
- `engine.js` : moteur narratif, états, décisions, compétence D20.
- `app.js`, `style.css` : interface.
- `server.js`, `wire.js` : serveur HTTP et WebSockets, sans dépendance.
- `build.py` : regénérer la version HTML autonome à partir des sources.
- `test.js`, `test-ui.js`, `test-online.js`, `test-campaign.js`, `test-resume.js` : tests automatisés.

Depuis le dossier :

```bash
node test.js && node test-ui.js && node test-online.js && node test-campaign.js && node test-resume.js
```

L'univers et les nouvelles intrigues sont des créations de jeu de rôle fictives ; la V2 est un prototype narratif, pas un jeu d'action 3D.
