# GTA Riviera — V5 · Riviera vivante

## Contenu

- La campagne commence au tout début du scénario 1, **avant** le rendez-vous avec Lucien. La montre éventuellement volée au Belladone dans la partie papier était une improvisation de joueurs, **pas un événement prévu** : aucune invitation au vol n'est intégrée dans la scène du bar. Les embranchements de la mission 2 conservent une compatibilité avec d'anciennes sauvegardes seulement.
- 16 portraits jouables au total : 4 portraits originaux et 12 nouveaux profils alternatifs.
- Création avec les cinq caractéristiques et spécialité +1 selon les règles **2D6**, choix d'**un contact** parmi six et d'**un défaut** parmi six. Ces choix produisent des bonus/malus situés, des changements d'argent ou de pression et parfois une nouvelle action narrative.
- Inventaire du groupe, équipements, consommables et pièces à conviction effectivement récupérées.
- Argent commun et commerces : Le Bazar des Quais, Boutique de la Promenade, Garage Costa ; quatre services (clinique, garage, informateur, intermédiaire).
- Équipement : **un objet actif maximum**, +1 sur la compétence choisie. Consommable : **un bonus préparé maximum**, dépensé au prochain jet compatible. Les objets sont achetés avec l'argent du jeu, et les services sont limités à une fois par scène.
- Les décisions, crédits, objets et équipements sont pris en charge par les sauvegardes solo et par les snapshots du serveur multijoueur. En ligne, seul l'hôte peut dépenser la caisse du groupe ; tous voient l'inventaire actualisé.

## Tests

`npm test`

## Sauvegardes permanentes

Le stockage PostgreSQL Render fonctionne lorsque `DATABASE_URL` est ajouté dans l'environnement du service. Les anciennes données ne sont pas effacées par cette version. Sans cette variable, les salons en ligne disparaissent après un redémarrage ; le solo conserve sa sauvegarde locale.
