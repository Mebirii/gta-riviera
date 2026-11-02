from pathlib import Path
import re,json
p=Path(__file__).parent
html=(p/'GTA_Riviera.html').read_text(encoding='utf-8')
assets={q.stem:'assets/'+q.name for q in sorted((p/'assets').glob('*.webp'))}
html=re.sub(r'<style>.*?</style>',lambda m:'<style>\n'+(p/'style.css').read_text(encoding='utf-8')+'\n</style>',html,count=1,flags=re.S)
scripts=list(re.finditer(r'<script>(.*?)</script>',html,flags=re.S))
assert len(scripts)==3,len(scripts)
js=["window.RivieraAssetUrls="+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';', (p/'world.js').read_text(encoding='utf-8')+'\n'+(p/'engine.js').read_text(encoding='utf-8'),(p/'app.js').read_text(encoding='utf-8')]
for m,body in reversed(list(zip(scripts,js))):
 html=html[:m.start()]+ '<script>\n'+body+'\n</script>'+html[m.end():]
(p/'GTA_Riviera.html').write_text(html,encoding='utf-8')
print('Generated web page',len(html),'chars, linked',len(assets),'local image assets')
