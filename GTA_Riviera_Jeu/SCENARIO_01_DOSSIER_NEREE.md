# GTA Riviera — Premier grand scénario : LE DOSSIER NÉRÉE

## Principes

**GTA Riviera est un jeu de rôle textuel à choix et jets 2D6, pas un GTA à manette.** Le joueur incarne un personnage avec son histoire, ses caractéristiques, ses alliés et ses failles. L'objectif est une enquête criminelle où les décisions et les réussites/échecs modifient l'histoire. Le mode Scénario reste jouable sans aucune clé IA.

Le dossier Nérée constitue une première **grande intrigue en deux actes** :
- **Acte I — La Nuit du Belladone :** premier contact avec Lucien, contrat inconnu, préparatifs, infiltration libre entre trois accès, suite 307, rencontre avec Cendre, sortie et conséquences.
- **Acte II — La Seconde Moitié :** au lendemain du Belladone, enquête sur la partie manquante du dossier, exploration des pistes liées à Porto Rosso, choix de la destination des informations et dénouements alternatifs.

Aucun personnage ne connaît le contenu de Nérée au début. **Le vol d'une montre au Belladone n'est pas un événement imposé** : c'était une improvisation de l'ancienne table. Personne, pas même Gauthier, ne mémorise des documents automatiquement.

## Quêtes annexes intégrées

| Quête | Déblocage réel | Moment | Conséquences possibles |
|---|---|---|---|
| **Les plaques fantômes** | Repérer la surveillance du garage (jet de Ruse réussi) ou connaître Nico le mécanicien | Avant d'entrer au Belladone | Identifier une piste, préparer un itinéraire ; difficulté de fuite réduite |
| **Le service de Nora** | Obtenir une indication de Lucien sur Nora ou connaître Sofia | Préparatifs | Obtenir une alliée, une relève, un badge, ou provoquer sa méfiance |
| **Le registre du personnel** | Découvrir le passage du personnel ou gagner la confiance de Nora | Escaliers du Belladone | Lire les rondes de Hugo, faciliter l'accès à la suite |
| **Les pas de Cendre** | Suivre Mara depuis la terrasse (réussite) | Escaliers du Belladone | Anticiper les rivaux ou les retarder, modifier la difficulté de récupérer le dossier |
| **Une employée introuvable** | Avoir gagné la confiance de Nora ou obtenu ses horaires | Après l'Acte I, au quartier général | Secourir Nora, découvrir une piste sur Porto Rosso, ou accroître la pression |
| **Le prix de la parole** | Avoir négocié une trêve avec Mara à la sortie de la suite | Après l'Acte I, au quartier général | Honorer une dette, obtenir une piste sur un convoi, conserver une preuve ou attirer l'attention |

Chaque quête est **facultative**. Le joueur peut toujours revenir à la trame principale. Les événements réussis et manqués ont des effets mécaniques. Les quêtes ne se répètent pas, et les sauvegardes mémorisent leur complétion.

## Opérations secondaires plus longues, après l'Acte I

- **Les Dettes de Lucien** : mission disponible si le groupe est en bons termes avec Lucien, s'il dispose d'informations particulières, ou à l'issue de l'Acte II.
- **Le Convoi Nocturne** : mission disponible si le groupe découvre une piste crédible vers Cendre, ou à l'issue de l'Acte II.
- **Nuit Blanche** : le gala se débloque après l'Acte II (ou les deux opérations annexes longues). C'est une affaire plus tardive, qui ne doit pas être proposée comme une quête de départ.

Les missions **ne sont pas à un ordre unique** après le Belladone. Les indices, les alliances et l'issue du scénario principal peuvent changer leur disponibilité.

## Carnet de quêtes

L'interface indique les deux actes du dossier Nérée, puis l'état de six quêtes annexes :
- **À découvrir** : uniquement un indice sur les conditions de déclenchement, jamais les secrets de la quête ;
- **Débloquée** : la quête et sa description apparaissent dans le journal, et l'action correspondante est proposée dans la scène appropriée ;
- **Terminée** : le journal conserve la trace ; l'action n'est plus proposée.

L'exploration de la carte V6 demeure disponible sous un panneau facultatif. La **scène et les choix du JDR occupent le premier plan**.

## Suite éditoriale envisagée

Cette version structure un premier grand scénario jouable en deux actes, avec une dizaine de nouvelles scènes annexes. Pour augmenter encore la durée du premier acte, les prochaines étapes logiques seraient : une scène de conséquences au garage, des interrogatoires plus développés, des dilemmes de loyauté et des épilogues propres à chaque contact. Les secrets de la campagne doivent être tenus dans un document MJ distinct du texte affiché aux joueurs.

## Tests

`node test-story-v8.js` couvre les quêtes verrouillées et débloquées, les récompenses, les seuils influencés, les retours de quête, la progression vers l'Acte II, les missions longues, et les sauvegardes anciennes.
