# GTA Riviera V3 — création de personnages et campagnes

## Nouveautés
- Personnage original : nom, biographie, portrait, couleur et 7 points de compétence (0 à 4 par aptitude).
- Personnage jouable en solo, en coop locale ou en ligne.
- Sauvegarde multijoueur sur PostgreSQL **si** `DATABASE_URL` est configuré. Les joueurs reconnectent depuis leur navigateur et l'hôte dispose d'une clé de reprise à garder secrète.
- Export de campagne JSON par l'hôte et import dans un nouveau salon pour sauvegarde de secours.
- Compatible avec l'histoire actuelle de Lucien / Nérée et les quatre missions.

## Mise en production
1. Publier le contenu de ce dossier **dans `GTA_Riviera_Jeu/`** sur https://github.com/Mebirii/gta-riviera (remplacer les fichiers existants). Ne jamais publier `.env` ou les identifiants de base de données.
2. Render se déploie automatiquement depuis `main` (auto-deploy actif).
3. Configurer sur Render `DATABASE_URL` à partir de l'**Internal Database URL** de la base `gta-riviera-savegames` (dans le dashboard Render). Cette URL est secrète, ne pas la communiquer dans le chat ni dans GitHub.
4. Vérifier dans les logs `Campagnes rechargees: ... Stockage durable: true`, puis `/health`.
5. Sauvegarder régulièrement une exportation JSON. **La base Render gratuite expire le 29 novembre 2026** ; il faudra migrer vers une solution durable avant l'expiration.

En l'absence de `DATABASE_URL`, le serveur démarre normalement mais les salons en ligne ne survivent pas au redémarrage. L'export/import JSON fonctionne toujours.

## Local
`npm install` puis `npm start`; ouvrir http://localhost:3000.
Tests : `npm test`.
