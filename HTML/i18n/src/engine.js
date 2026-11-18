/* Nomimatcha — Hebrew layer. Built from i18n/src by i18n/build.py. Do not edit he.js by hand.
   - Language is stored in localStorage "nm-lang-v1" ("en" | "he"); ?lang=he / ?lang=en sets it.
   - Hebrew mode: <html lang="he" dir="rtl" class="he">, Adapter Hebrew Text is injected, and every
     English string found in the page (and added later by page scripts) is swapped using NM_HE_DICT.
   - ?i18n=miss prints every English string with no Hebrew yet into <pre id="nm-miss"> at the end of <body>. */
(function(){
  var KEY='nm-lang-v1', root=document.documentElement, lang='en';
  try{
    var q=new URLSearchParams(location.search), ql=q.get('lang')||(q.get('dir')==='rtl'?'he':'');
    if(ql==='he'||ql==='en'){localStorage.setItem(KEY,ql)}
    lang=localStorage.getItem(KEY)==='he'?'he':'en';
  }catch(e){}
  var D=window.NM_HE_DICT=window.NM_HE_DICT||{}, R=window.NM_HE_RULES=window.NM_HE_RULES||[];
  var api=window.NMHE={lang:lang,miss:{}};
  function setLang(l){try{localStorage.setItem(KEY,l)}catch(e){}
    try{var u=new URL(location.href); u.searchParams.delete('lang'); u.searchParams.delete('dir'); if(u.href!==location.href){location.replace(u.href); return}}catch(e){}
    location.reload()}
  api.set=setLang;

  /* small globe button in the nav bar (.tools) that flips EN <-> HE; added on every page that has the standard nav */
  function addLangBtn(){
    var t=document.querySelector('.bar .tools, header .tools'); if(!t||document.getElementById('nm-lbtn')||!t.querySelector('.ic')) return;
    var b=document.createElement('button'); b.type='button'; b.id='nm-lbtn'; b.className='ic';
    var lbl=lang==='he'?'Switch language to English':'Switch language to Hebrew';
    b.setAttribute('aria-label',lang==='he'?'החלפת שפה לאנגלית':lbl); b.title=b.getAttribute('aria-label');
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2"/><path d="M12 3.4c2.3 2.4 3.5 5.3 3.5 8.6s-1.2 6.2-3.5 8.6c-2.3-2.4-3.5-5.3-3.5-8.6s1.2-6.2 3.5-8.6z"/></svg>';
    b.addEventListener('click',function(){setLang(lang==='he'?'en':'he')});
    t.insertBefore(b,t.firstChild);
  }

  /* language switches that already exist in the markup (.d-lang in the menu, .f-lang in the footer) */
  function wireSwitch(){
    addLangBtn();
    var sw=document.querySelectorAll('.d-lang, .f-lang, [data-lang-switch]');
    for(var i=0;i<sw.length;i++){
      var as=sw[i].querySelectorAll('a'); if(as.length<2) continue;
      as[0].classList.toggle('on',lang==='en'); as[1].classList.toggle('on',lang==='he');
      as[0].setAttribute('lang','en'); as[1].setAttribute('lang','he');
      as[0].setAttribute('aria-current',lang==='en'?'true':'false'); as[1].setAttribute('aria-current',lang==='he'?'true':'false');
      if(!sw[i].__nm){sw[i].__nm=1; sw[i].addEventListener('click',function(e){var a=e.target.closest('a'); if(!a)return; e.preventDefault(); var l=a===this.querySelectorAll('a')[1]?'he':'en'; if(l!==lang)setLang(l)})}
    }
  }
  api.wire=wireSwitch;
  if(lang!=='he'){
    document.addEventListener('DOMContentLoaded',wireSwitch);
    return;
  }

  root.lang='he'; root.dir='rtl'; root.classList.add('he');
  var st=document.createElement('style'); st.id='nm-he-css'; st.textContent=window.NM_HE_CSS||''; (document.head||root).appendChild(st);

  function norm(s){return s.replace(/\s+/g,' ').trim()}
  function plain(v){return v.indexOf('\u00a6')<0?v:v.replace(/\u00a6/g,' ')}
  var SKIP={SCRIPT:1,STYLE:1,NOSCRIPT:1,TEXTAREA:1,SVG:1,svg:1,CANVAS:1,CODE:1,PRE:1,TEMPLATE:1,TITLE:0};
  var HEB=/[֐-׿]/, LAT=/[A-Za-z]{2}/;
  function lookup(k){
    if(Object.prototype.hasOwnProperty.call(D,k)) return D[k];
    for(var i=0;i<R.length;i++){var m=R[i][0].exec(k); if(m) return typeof R[i][1]==='function'?R[i][1].apply(null,m):k.replace(R[i][0],R[i][1])}
    return null;
  }
  var mc=0;
  function miss(k){ if(k.length>1 && !HEB.test(k)){ api.miss[k]=1; mc++ } }
  /* "2 g" in an RTL line is shown as "g 2" by the bidi algorithm: keep number + Latin unit together as one LTR run */
  var UNIT=/(\d[\d.,]*\s(?:g|kg|ml|cm|mm|s|mesh|tines|bowls)\b|\d[\d.,]*\s?°C|°C)/g, UNIT_T=/\d\s(?:g|kg|ml|cm|mm|s|mesh|tines|bowls)\b|°C/, LRI='\u2066', PDI='\u2069';
  function iso(s){ return (UNIT_T.test(s)&&s.indexOf(LRI)<0) ? s.replace(UNIT,LRI+'$1'+PDI) : s }
function doText(t){
    var v=t.nodeValue; if(!v) return;
    var pn=t.parentNode; if(!pn||SKIP[pn.nodeName]||(pn.closest&&pn.closest('#nm-miss,[data-no-i18n]'))) return;
    if(v.indexOf(LRI)>=0) return;
    var k=norm(v), r=null;
    if(!HEB.test(v)&&/[A-Za-z]/.test(v)) r=lookup(k);
    if(r!=null){ if(r===k) r=null; else r=v.match(/^\s*/)[0]+iso(plain(r))+v.match(/\s*$/)[0] }
    else if(!HEB.test(v)&&LAT.test(v)) miss(k);
    var out=r!=null?r:iso(v);          /* untranslated "30 g" etc. still get the bidi fix */
    if(out!==v) t.nodeValue=out;
  }
  var ATTR=['aria-label','placeholder','title','alt','data-label','data-l'];
  function doAttrs(e){
    for(var i=0;i<ATTR.length;i++){var v=e.getAttribute&&e.getAttribute(ATTR[i]); if(v&&LAT.test(v)&&!HEB.test(v)){var r=lookup(norm(v)); if(r!=null){ if(r!==norm(v))e.setAttribute(ATTR[i],plain(r)) } else miss(norm(v))}}
  }
  function walk(n){
    if(n.nodeType===3){doText(n);return}
    if(n.nodeType!==1||SKIP[n.nodeName]||(n.id==='nm-miss')) return;
    if(n.hasAttribute('data-no-i18n')) return;
    doAttrs(n);
    var c=n.firstChild, hasEl=false, hasTx=false;
    if(n.firstElementChild&&n.children.length<=14){
      var tx=n.textContent; if(tx.length<320&&LAT.test(tx)&&!HEB.test(tx)){
        var tw=document.createTreeWalker(n,4,null), nodes=[], tn, parts=[];
        while((tn=tw.nextNode())){ if(/[A-Za-z]/.test(tn.nodeValue)&&!SKIP[tn.parentNode.nodeName]){nodes.push(tn);parts.push(norm(tn.nodeValue))} }
        if(nodes.length>1){
          var mk=lookup(parts.join(' '));
          if(mk!=null&&mk.indexOf('\u00a6')>=0){
            var pc=mk.split('\u00a6');
            for(var q=0;q<nodes.length;q++){ var val=q<nodes.length-1?(pc[q]||''):pc.slice(q).join(' '); var o=nodes[q].nodeValue; nodes[q].nodeValue=(val?o.match(/^\s*/)[0]:'')+val+(val?o.match(/\s*$/)[0]:'') }
            return;
          }
        }
      }
    }
    for(;c;c=c.nextSibling){ if(c.nodeType===1&&!SKIP[c.nodeName])hasEl=true; else if(c.nodeType===3&&c.nodeValue.trim())hasTx=true }
    if(hasEl&&hasTx){ /* mixed inline content: try the whole element as one phrase */
      var k=norm(n.innerHTML), r=lookup(k);
      if(r!=null){ if(r!==k) n.innerHTML=r; return }
      var m0=mc;
    }
    for(c=n.firstChild;c;){var nx=c.nextSibling; walk(c); c=nx}
    if(typeof m0!=='undefined'&&hasEl&&hasTx&&mc>m0){ api.mix=api.mix||{}; api.mix[norm(n.innerHTML).slice(0,600)]=1 }
  }
  var ARW=/l([\d.]+) \1-\1 \1/;
  function selfFlipped(p){  /* some pages already mirror their own arrows (:lang(he) / [dir=rtl] rules): do not flip twice */
    try{ for(var e=p.closest('svg'),k=0;e&&k<4;e=e.parentElement,k++){ var t=getComputedStyle(e).transform; if(t&&/^(matrix\(-1|scaleX\(-1|scale\(-1)/.test(t)) return true } }catch(x){}
    return false;
  }
  /* "inset-inline-start:50% + translateX(-50%)" centres in LTR but pushes the element off-centre in RTL: pin those to the physical left/right */
  var centred=false;
  function fixCentering(){
    if(centred) return; centred=true; var out=[];
    function scan(rules,media){
      for(var i=0;i<rules.length;i++){var r=rules[i];
        if(r.cssRules&&r.type===4){scan(r.cssRules,r.conditionText||r.media.mediaText); continue}
        if(r.type!==1||!r.style) continue;
        var a=r.style.getPropertyValue('inset-inline-start'), b=r.style.getPropertyValue('inset-inline-end');
        var css='';
        if(a==='50%') css+='inset-inline-start:auto!important;left:50%!important;';
        if(b==='50%') css+='inset-inline-end:auto!important;right:50%!important;';
        if(css){ var rule=r.selectorText+'{'+css+'}'; out.push(media?'@media '+media+'{'+rule+'}':rule) }
      }
    }
    try{ for(var j=0;j<document.styleSheets.length;j++){ var sh=document.styleSheets[j]; if(sh.ownerNode&&sh.ownerNode.id==='nm-he-css') continue; try{scan(sh.cssRules,'')}catch(e){} } }catch(e){}
    if(out.length){ var st2=document.createElement('style'); st2.id='nm-he-centre'; st2.textContent=out.join('\n'); document.head.appendChild(st2) }
  }
  /* physical left/right padding, margin, borders and text-align are written for LTR: mirror every rule where the two sides differ */
  var mirrored=false;
  function fixPhysical(){
    if(mirrored) return; mirrored=true; var out=[], SKIP_SEL=/^\.t(\.|\s|$|,)|\.strip|\.vz|#s2\.hero|#hz|^\.hero1/;
    function scan(rules,media){
      for(var i=0;i<rules.length;i++){var r=rules[i];
        if(r.cssRules&&r.type===4){scan(r.cssRules,r.conditionText||r.media.mediaText); continue}
        if(r.type!==1||!r.style||SKIP_SEL.test(r.selectorText)) continue;
        var st=r.style, css='', pl, pr;
        pl=st.getPropertyValue('padding-left'); pr=st.getPropertyValue('padding-right'); if(pl&&pr&&pl!==pr) css+='padding-left:'+pr+'!important;padding-right:'+pl+'!important;';
        pl=st.getPropertyValue('margin-left'); pr=st.getPropertyValue('margin-right'); if(pl&&pr&&pl!==pr) css+='margin-left:'+pr+'!important;margin-right:'+pl+'!important;';
        var bl=st.getPropertyValue('border-left'), br=st.getPropertyValue('border-right');
        if(bl&&br&&bl!==br) css+='border-left:'+br+'!important;border-right:'+bl+'!important;';
        else if(bl&&!br&&!/^0|none/.test(bl)) css+='border-right:'+bl+'!important;border-left:0 none!important;';
        else if(br&&!bl&&!/^0|none/.test(br)) css+='border-left:'+br+'!important;border-right:0 none!important;';
        var ta=st.getPropertyValue('text-align'); if(ta==='left') css+='text-align:right!important;'; else if(ta==='right') css+='text-align:left!important;';
        if(css){ var rule=r.selectorText+'{'+css+'}'; out.push(media?'@media '+media+'{'+rule+'}':rule) }
      }
    }
    try{ for(var j=0;j<document.styleSheets.length;j++){ var sh=document.styleSheets[j]; if(sh.ownerNode&&/^nm-he/.test(sh.ownerNode.id||'')) continue; try{scan(sh.cssRules,'')}catch(e){} } }catch(e){}
    if(out.length){ var st3=document.createElement('style'); st3.id='nm-he-mirror'; st3.textContent=out.join('\n'); document.head.appendChild(st3) }
  }
  function flip(n){
    if(n.nodeType!==1) return;
    var ps=n.tagName==='path'?[n]:(n.querySelectorAll?n.querySelectorAll('svg path[d]'):[]);
    for(var i=0;i<ps.length;i++){var d=ps[i].getAttribute('d')||''; if(ARW.test(d)&&!ps[i].closest('.f-top,[data-no-flip]')&&!selfFlipped(ps[i])) ps[i].classList.add('nm-flip')}
  }
  api.sweep=function(n){ fixCentering(); fixPhysical(); flip(n||document.body); walk(n||document.body||root); wireSwitch() };
  api.translate=function(s){var r=lookup(norm(s)); return r==null?s:r};

  if(D['__title__']!==undefined||true){
    var t0=function(){var r=lookup(norm(document.title)); if(r!=null)document.title=r}; t0();
  }

  var mo=new MutationObserver(function(ms){
    for(var i=0;i<ms.length;i++){var m=ms[i];
      if(m.type==='characterData'){doText(m.target)}
      else if(m.type==='attributes'){doAttrs(m.target)}
      else for(var j=0;j<m.addedNodes.length;j++){walk(m.addedNodes[j]); flip(m.addedNodes[j])}
    }
  });
  mo.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});

  document.addEventListener('DOMContentLoaded',function(){
    api.sweep(document.body);
    if(/[?&]i18n=miss/.test(location.search)) setTimeout(function(){
      var pre=document.createElement('pre'); pre.id='nm-miss'; pre.style.cssText='display:none'; pre.textContent=JSON.stringify(Object.keys(api.miss).concat(Object.keys(api.mix||{}).map(function(x){return '<>'+x}))); document.body.appendChild(pre)
    },2500);
  });
})();
