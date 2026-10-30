#!/usr/bin/env python3
from pathlib import Path
from html import escape
import base64
import json
p=Path(__file__).resolve().parent
style=(p/'style.css').read_text()
engine=(p/'engine.js').read_text()
app=(p/'app.js').read_text()
assets={f.stem:'data:image/webp;base64,'+base64.b64encode(f.read_bytes()).decode('ascii') for f in sorted((p/'assets').glob('*.webp'))}
asset_script='window.RivieraAssetUrls='+json.dumps(assets,separators=(',',':'))+';'
html='''<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="theme-color" content="#080e19"/><meta name="description" content="GTA Riviera : campagne interactive, missions à choix, jeu solo ou multijoueur sur serveur."/><title>GTA Riviera — Jeu interactif</title><style>'''+style.replace('</style>', '<\\/style>')+'''</style></head><body><div id="app" aria-live="polite"></div><script>'''+asset_script+'''</script><script>'''+engine.replace('</script>', '<\\/script>')+'''</script><script>'''+app.replace('</script>', '<\\/script>')+'''</script></body></html>'''
(p/'GTA_Riviera.html').write_text(html,encoding='utf-8')
print('HTML generated:',len(html),'bytes')
