#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js est requis : installez la version LTS depuis https://nodejs.org/fr"
  read -r -p 'Appuyez sur Entrée pour fermer...'
  exit 1
fi
echo "Lancement du serveur GTA Riviera..."
node server.js &
GAME_PID=$!
trap 'kill "$GAME_PID" 2>/dev/null' EXIT INT TERM
sleep 2
open 'http://localhost:3000'
echo "Serveur actif : http://localhost:3000"
echo "Gardez cette fenêtre ouverte pendant la partie. Ctrl+C pour arrêter."
wait "$GAME_PID"
