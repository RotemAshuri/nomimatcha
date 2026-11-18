#!/usr/bin/env python3
"""Builds HTML/i18n/he.js = fonts+CSS (src/he.css, src/fonts/*.woff2) + dictionary (src/dict-*.txt) + engine (src/engine.js).
Dictionary format: one entry per line, `English || עברית`. `#` starts a comment line. Keys are the page text with
whitespace collapsed. A line `/regex/ || replacement` (with $1.. groups) is a pattern rule."""
import base64,glob,json,os,re
H=os.path.dirname(os.path.abspath(__file__)); S=os.path.join(H,'src')
# NOTE: the TRIAL files replace final pe (U+05E3) and final tsadi (U+05E5) with a 'removed' box glyph, so those two letters are excluded
# from unicode-range and fall back to the system Hebrew font until the full licensed font is dropped into src/fonts.
fonts={}
for w in ('400','500','600','700'):
    fonts[w]=base64.b64encode(open(os.path.join(S,'fonts',f'ah-{w}.woff2'),'rb').read()).decode()
ff=''.join(f"@font-face{{font-family:'Adapter Hebrew Text';font-style:normal;font-weight:{w};font-display:swap;unicode-range:U+0590-05E2,U+05E4,U+05E6-05FF,U+FB1D-FB4F,U+20AA,U+00A0,U+00B7,U+00D7,U+2000-206F,U+0021-002F,U+003A-0040,U+005B-0060,U+007B-007E;src:url(data:font/woff2;base64,{b}) format('woff2')}}\n" for w,b in fonts.items())
css=ff+open(os.path.join(S,'he.css'),encoding='utf-8').read()
D={};R=[];dup=[]
for fn in sorted(glob.glob(os.path.join(S,'dict-*.txt'))):
    for n,line in enumerate(open(fn,encoding='utf-8'),1):
        line=line.rstrip('\n')
        if not line.strip() or line.lstrip().startswith('#'): continue
        if ' || ' not in line: print('BAD LINE',os.path.basename(fn),n,line[:60]); continue
        k,v=line.split(' || ',1); k=k.strip(); v=v.strip()
        if v=='∅': v=''
        if k.startswith('/') and k.endswith('/'): R.append([k[1:-1],v]); continue
        if k in D and D[k]!=v: dup.append((k,os.path.basename(fn)))
        D[k]=v
rules=','.join('[new RegExp(%s),%s]'%(json.dumps(r[0]),json.dumps(r[1]) if not r[1].startswith('=>') else r[1][2:]) for r in R)
out='window.NM_HE_CSS=%s;\nwindow.NM_HE_DICT=%s;\nwindow.NM_HE_RULES=[%s];\n'%(json.dumps(css),json.dumps(D,ensure_ascii=False),rules)
out+=open(os.path.join(S,'engine.js'),encoding='utf-8').read()
open(os.path.join(H,'he.js'),'w',encoding='utf-8').write(out)
print('he.js',len(out)//1024,'KB;',len(D),'strings;',len(R),'rules;',len(dup),'conflicting dupes',dup[:5])
