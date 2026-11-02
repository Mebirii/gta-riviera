# GTA Riviera V7 — Mode MJ IA fidèle au scénario

Le mode MJ IA est **une option en plus du mode Scénario**, non un remplacement. GTA Riviera reste un jeu de rôle textuel : pas de manette ni de conduite libre. Le mode narratif est disponible pour **1 à 4 joueurs**, dans un salon WebSocket existant.

## Jouer

1. À l'accueil, sélectionner **MJ IA · Bêta**.
2. Créer sa fiche (nom, portrait, compétences, contact et défaut), puis créer un salon.
3. Partager éventuellement le code avec les autres joueurs **avant le lancement**, ou lancer seul.
4. Écrire librement les actions dans le champ « Votre action libre ».
5. Lire les descriptions et réactions des PNJ par le MJ. Les **2D6 sont lancés sur le serveur** (avec compétences, équipement, spécialité, contact et malus applicables).
6. L'hôte peut **exporter sa campagne** et importer une sauvegarde du même mode dans un nouveau salon.

## Fidélité narrative

Le MJ commence **avant la première rencontre avec Lucien**, avec uniquement un message anonyme pour le garage des Tamaris. La progression s'organise en 6 étapes : premier contact, contrat, préparatifs, Belladone, suite 307, conséquences. Le MJ improvise les répliques et solutions **sans imposer le déroulement exact**. Les étapes avancent uniquement d'une étape à la fois.

Le vol de la montre du Belladone était une improvisation de la partie papier et n'est pas dans les événements scénarisés. Gauthier ne possède aucune connaissance automatique du dossier Nérée. Les pièces du dossier ne sont attribuées que si elles sont véritablement récupérées dans l'histoire.

Les instructions et briefs narratifs sont **côté serveur** ; la réponse publique contient les actions jouées, le récit, les dés et les informations déjà révélées. L'état des campagnes et les événements sont enregistrés selon la configuration de stockage.

## Activer l'IA gratuitement avec Gemini

**Aucun abonnement OpenAI API n'est nécessaire.** Le MJ utilise exclusivement l'API Gemini avec le modèle `gemini-2.5-flash-lite`. Nous ne conservons pas de recours automatique à une API payante. La clé `OPENAI_API_KEY` n'est plus utilisée.

1. Dans [Google AI Studio](https://aistudio.google.com/apikey), créer une clé Gemini dans un projet **Free Tier** (niveau gratuit, sans activation de la facturation).
2. Vérifier dans Google AI Studio que le projet reste au niveau **Free**. Ne pas passer au niveau payant.
3. Dans Render > gta-riviera > **Environment**, ajouter une variable **secrète** `GEMINI_API_KEY`, puis sauvegarder pour relancer le service.
4. Le mode MJ IA s'activera automatiquement dès que le serveur dispose de cette clé.

Le niveau gratuit est soumis aux limites propres au compte et au modèle (requêtes, tokens, quotas quotidiens). Quand ces limites sont atteintes, le MJ affiche une erreur de quota au lieu de basculer vers un service payant. Le jeu conserve sa progression existante.

**Confidentialité :** l'offre gratuite Gemini peut utiliser les textes transmis pour améliorer les produits de Google. N'entrez pas de données personnelles sensibles dans les récits de partie. Une clé API doit rester secrète sur Render, jamais dans GitHub ni le navigateur.

Variables optionnelles :
- `MJ_AI_MAX_CALLS_PER_HOUR` : maximum local de requêtes d'IA sur une heure (80 par défaut). Une action risquée utilise deux appels (un pour proposer le jet et un pour raconter son résultat).
- `DATABASE_URL` : PostgreSQL pour sauvegarder les salons après redémarrage de Render. Sans base permanente, exporter régulièrement la partie en JSON.

## Limites du prototype V7

- Les salons permettent de joindre l'équipe avant de lancer la partie ; un nouveau joueur ne rejoint pas une campagne déjà commencée.
- L'IA propose la résolution, mais le moteur conserve la maîtrise des dés et de la progression.
- Les boutiques interactives et la carte V6 restent disponibles dans le mode Scénario ; leur traduction en actions naturelles dans le mode MJ IA sera un chantier ultérieur.
- Le scénario est protégé par des consignes et des transitions de phases, mais un modèle génératif peut se tromper. Des tests narratifs plus poussés sont recommandés avant une utilisation longue.
- Sans `OPENAI_API_KEY`, l'écran de préparation existe mais le lancement MJ IA est bloqué : **ce n'est pas un faux chatbot de démonstration**.

## Tests

`npm test` : tests historiques de la campagne, interface, inventaire et multijoueur, plus les tests MJ IA sans véritable appel à Gemini (API simulée).
