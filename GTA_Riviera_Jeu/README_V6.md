# GTA Riviera — V6 · La ville interactive

La V6 ajoute une couche d'exploration au-dessus du JDR original **sans modifier les scènes ni le déroulement du scénario 1**.

## Jouer

- Ouvrir une partie solo, locale ou multijoueur, puis consulter **Explorer la Riviera** sous la scène narrative.
- Cliquer sur les quartiers de la carte : Belle-Rive, Vieux-Port, Centre-ville, La Corniche, Vieille Ville.
- Les boutiques et services sont utilisables uniquement dans leur quartier, pendant les phases d'exploration.
- Rencontrer des contacts (une fois par campagne). Un contact déjà présent dans la fiche peut améliorer la cohésion du groupe.
- Accomplir jusqu'à trois petites activités facultatives, non répétables, pour obtenir des ressources.
- Pendant les scènes fermées du Belladone, les déplacements et achats sont bloqués ; l'équipement et les consommables restent accessibles.
- En multijoueur, seul l'hôte choisit les déplacements et dépenses. Tous les joueurs reçoivent le même état synchronisé.
- Déplacements, rencontres, activités et visites sont conservés dans les sauvegardes solo et les snapshots du serveur.

## Compatibilité

Les sauvegardes V5 sont conservées. Une sauvegarde ancienne sans état de ville démarre à Belle-Rive, sans perdre la mission en cours. Le jeu conserve sa mécanique 2D6 et les éventuels événements improvisés ne sont pas devenus des événements imposés.

## Test

`npm test` vérifie le scénario, le système d'inventaire, les achats, les sessions multijoueurs et les nouveaux déplacements.

La carte actuelle utilise une illustration stylisée et des points de navigation. Il ne s'agit pas encore d'un système de circulation libre avec routes, durée de trajet ou véhicules pilotables.

## Déploiement

Service Render `gta-riviera` sur la branche `main`. L'application est servie à la racine ; `GTA_Riviera.html` est généré à partir de `style.css`, `world.js`, `engine.js` et `app.js` par `python build_v4.py`.