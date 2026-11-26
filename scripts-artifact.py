# Converte dist-single/index.html em fragmento para publicar como Artifact (prévia).
import re,sys
h=open('dist-single/index.html').read()
styles=''.join(re.findall(r'<style[^>]*>.*?</style>',h,re.S))
scripts=''.join(re.findall(r'<script type="module"[^>]*>.*?</script>',h,re.S))
out=f'''<title>Forja Treino</title>
<meta name="theme-color" content="#07090b">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap">
{styles}
<div id="root"></div>
{scripts}
'''
open('dist-single/forja-treino.html','w').write(out)
print(len(out))
