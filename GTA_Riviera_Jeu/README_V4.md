# GTA Riviera V4 — La Nuit du Belladone

## Ce qui change

- **Le scénario 1 commence au tout début** : arrivée à Riviera d'Oro, appel anonyme, premier rendez-vous avec Lucien, contrat de la suite 307, préparation, hôtel Belladone, Hugo, Nora, Mara et équipe Cendre, récupération du dossier et sortie. Personne ne connaît le dossier Nérée au départ.
- **Les événements de la vraie partie ne sont plus imposés** : vol de montre et mémorisation du dossier sont des choix ou des réussites possibles, jamais des faits prédéterminés.
- **Les règles originales des fiches JDR sont rétablies** : Physique, Ruse, Technique, Bagout et Pilotage. Répartition +2 / +1 / +1 / 0 / 0, spécialité +1, jets de 2D6 contre une difficulté (7 / 9 / 11 / 13).
- **Un éditeur de personnage complet et visible dès l'accueil** : nom, surnom, archétype, portraits, couleurs, métier ou passé, motivation, faille, spécialité, contacts, équipement, notes. Pression et blessures initiales sont affichées sur la fiche ; le jeu conserve ses indicateurs de pression collective.
- **Images retravaillées** : suppression des portions d'ancienne interface visibles dans certaines illustrations, nouveaux cadrages pour les portraits, ajustements responsive et écrans scénarisés.
- **Cinq opérations dans l'ordre** : scénario 1 d'abord, puis missions ultérieures déverrouillées dans la carte de campagne.

## Jouer localement

Ouvrir `GTA_Riviera.html` pour jouer en solo ou sur un écran partagé. Le HTML contient ses illustrations et fonctionne sans serveur, tandis que les parties locales sont enregistrées par le navigateur.

## Jouer en ligne

- Depuis ce dossier : `npm install` puis `npm start`.
- Ouvrir `http://localhost:3000` ; créer ou rejoindre un salon.
- Sur Render, le service existant `gta-riviera` utilise déjà la branche `main` et peut servir ce dossier avec :
  - Build : `cd GTA_Riviera_Jeu && npm install --omit=dev`
  - Start : `cd GTA_Riviera_Jeu && npm start`
- Les salles peuvent être sauvegardées en PostgreSQL **uniquement si** `DATABASE_URL` est correctement configuré sur Render. Le projet conserve également l'export/import JSON de secours.

## Mettre à jour la V2 ou la V3 depuis GitHub

1. Télécharger et décompresser `GTA_Riviera_V4_Pret_a_publier.zip`.
2. Ouvrir le dossier GitHub **`Mebirii/gta-riviera/GTA_Riviera_Jeu`** sur la branche `main`.
3. Utiliser **Add file → Upload files** et sélectionner **le contenu** du dossier décompressé `GTA_Riviera_Jeu` (y compris `assets/`), en remplaçant les fichiers existants.
4. Valider avec **Commit changes**.
5. Render redéploiera automatiquement la branche mise à jour. Vérifier que le statut du déploiement est **Live** avant de jouer à plusieurs.

**Attention :** un ancien salon sauvegardé dans une version antérieure peut nécessiter un nouvel export ou une nouvelle campagne. L'ancienne version reste en ligne tant que la nouvelle n'a pas été chargée sur GitHub.

## Tests

`npm test` vérifie le système 2D6, 500 parcours narratifs du scénario 1, la création de profil, l'interface de création, la connexion WebSocket, les votes et la transition vers la suite.
