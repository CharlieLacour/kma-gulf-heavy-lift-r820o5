(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
var Q=new URLSearchParams(location.search);
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(Q.has('still'))REDUCED=true;
var OG=Q.has('og');
function el(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,a){var t=el('text',Object.assign({x:x,y:y},a||{}),p);t.textContent=s;return t;}
var world=document.getElementById('world'), par=document.getElementById('parallax');
var slides=[].slice.call(document.querySelectorAll('.slide'));
var N=slides.length;
// stagger index for entrance effects
slides.forEach(function(s){[].forEach.call(s.querySelectorAll('.fx'),function(e,i){e.style.setProperty('--i',i);});});

/* ---------- geography (same schematic coast + markers as the deck's slide 2 map) ---------- */
var COAST=[[-97.15,26.0],[-97.4,27.8],[-96.5,28.4],[-95.3,28.9],[-94.8,29.4],[-93.3,30.0],[-91.3,29.5],[-90.6,29.15],[-89.6,28.95],[-89.0,29.2],[-88.0,30.4]];
var HUB={n:'KMA hub — Kingwood, TX',lon:-95.19,lat:29.98};
var P=[
 ['Port Arthur LNG',-93.96,29.89,'n',-94.75,30.75,'end',1],
 ['Golden Pass',-93.88,29.71,'n',-95.6,29.15,'end',1],
 ['CP2 (Cameron Parish)',-93.44,29.61,'o',-92.6,28.95,'start',1],
 ['Commonwealth LNG',-93.31,29.69,'o',-93.55,31.15,'end',1],
 ['Woodside LNG',-93.11,29.75,'o',-92.75,30.95,'start',1],
 ['SpaceX Starbase LA',-92.07,29.55,'o',-91.6,30.45,'start',1],
 ['Delfin FLNG (offshore)',-93.61,28.30,'o',-93.42,28.42,'start',0],
 ['Corpus Christi Lng.',-97.16,27.65,'n',-96.98,27.82,'start',0],
 ['Rio Grande LNG',-97.21,25.95,'n',-97.03,26.12,'start',0]
];
var META=['Meta Richland DC',-92.12,32.2];
function WX(lon){return (lon+98.5)*1000;} function WY(lat){return (33.2-lat)*1000;}

function drawCanvas(){
  var c=document.getElementById('canvas'); c.innerHTML='';
  c.setAttribute('viewBox','0 0 12000 8200');
  var pts=COAST.map(function(p){return WX(p[0])+','+WY(p[1]);});
  // Gulf water: below the coast line
  el('path',{d:'M'+WX(-97.15)+',8800 L'+pts.join(' L')+' L'+WX(-88)+',8800 Z',fill:'#CFE0EC'},c);
  var g=el('g',{stroke:'#B6C8D8','stroke-width':6,fill:'none',opacity:.7},c);
  for(var lo=-98;lo<=-87;lo++)el('line',{x1:WX(lo),y1:0,x2:WX(lo),y2:8200,'stroke-dasharray':lo%2?'10 40':'none'},g);
  for(var la=26;la<=33;la++)el('line',{x1:0,y1:WY(la),x2:12000,y2:WY(la),'stroke-dasharray':'10 40'},g);
  var gl=el('g',{fill:'#7F93A6','font-size':70,'font-weight':700},c);
  for(lo=-98;lo<=-88;lo+=2)txt(gl,WX(lo)+20,8120,lo+'°');
  for(la=26;la<=33;la++)txt(gl,40,WY(la)-20,la+'°N');
  el('polyline',{points:pts.join(' '),fill:'none',stroke:'#0B2A4A','stroke-width':22,'stroke-linejoin':'round','stroke-linecap':'round'},c);
  // route through slides (drawn later, after layout)
  c.appendChild(el('g',{id:'route'}));
  var mk=el('g',{},c);
  P.forEach(function(p){
    var x=WX(p[1]),y=WY(p[2]),col=p[3]==='o'?'#E8622D':'#0B2A4A';
    var tx=WX(p[4]),ty=WY(p[5]);
    if(p[7])el('line',{x1:tx,y1:ty,x2:x,y2:y,stroke:'#0B2A4A','stroke-width':8},mk);
    el('circle',{cx:x,cy:y,r:46,fill:col,stroke:'#fff','stroke-width':12},mk);
    txt(mk,tx+(p[7]?(p[6]==='end'?-16:16):0),ty+30,p[0],{'font-size':88,'font-weight':700,fill:'#0B2A4A','text-anchor':p[6],stroke:'#EAF1F7','stroke-width':16,'paint-order':'stroke'});
  });
  el('rect',{x:WX(META[1])-40,y:WY(META[2])-40,width:80,height:80,fill:'#E8622D'},mk);
  txt(mk,WX(META[1])+80,WY(META[2])-50,META[0],{'font-size':88,'font-weight':700,fill:'#0B2A4A',stroke:'#EAF1F7','stroke-width':16,'paint-order':'stroke'});
  var hx=WX(HUB.lon),hy=WY(HUB.lat);
  el('path',{d:star(hx,hy,120,50),fill:'#E8622D',stroke:'#0B2A4A','stroke-width':12},mk);
  txt(mk,hx+60,hy+260,HUB.n,{'font-size':110,'font-weight':700,fill:'#E8622D','text-anchor':'middle',stroke:'#EAF1F7','stroke-width':18,'paint-order':'stroke'});
  // overview titles
  var tg=el('g',{},c);
  txt(tg,600,520,'KMA Corporation x Charlie Lacour',{'font-size':230,'font-weight':700,fill:'#0B2A4A'});
  txt(tg,610,760,'Gulf Coast heavy lift & heavy haul — the teaser',{'font-size':140,'font-weight':700,fill:'#E8622D'});
  txt(tg,600,8020,'KMA Corporation and Charlie Lacour — confidential, released on agreement of terms',{'font-size':90,fill:'#5A6878'});
  txt(tg,6900,8020,'Schematic map; positions approximate.',{'font-size':80,fill:'#5A6878'});
  c.appendChild(el('g',{id:'badges'}));
}
function star(cx,cy,R,r){var d='';for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1);}return d+'Z';}

/* ---------- slide 2 map (vector rebuild of the deck chart) ---------- */
function drawS2Map(){
  var s=document.getElementById('s2map'); s.innerHTML='';
  var L=40,R=539,T=8,B=323;
  function X(lon){return L+(lon+98.5)/12*(R-L);} function Y(lat){return T+(33.2-lat)/8.2*(B-T);}
  el('rect',{x:L,y:T,width:R-L,height:B-T,fill:'#fff',stroke:'#8A99A8','stroke-width':1},s);
  var pts=COAST.map(function(p){return X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1);});
  el('path',{d:'M'+pts.join(' L')+' L'+X(-88)+','+Y(25.2)+' L'+X(-97.15)+','+Y(25.2)+'Z',fill:'#DDE9F2'},s);
  el('polyline',{points:pts.join(' '),fill:'none',stroke:'#0B2A4A','stroke-width':1.8,'stroke-linejoin':'round'},s);
  var ax=el('g',{fill:'#0B2A4A','font-size':8},s);
  for(var lo=-98;lo<=-88;lo+=2){el('line',{x1:X(lo),y1:B,x2:X(lo),y2:B+4,stroke:'#8A99A8'},s);txt(ax,X(lo),B+13,'−'+Math.abs(lo),{'text-anchor':'middle'});}
  for(var la=25;la<=33;la++){el('line',{x1:L-4,y1:Y(la),x2:L,y2:Y(la),stroke:'#8A99A8'},s);txt(ax,L-6,Y(la)+3,String(la),{'text-anchor':'end'});}
  txt(ax,(L+R)/2,B+28,'Longitude (schematic — positions approximate)',{'text-anchor':'middle','font-size':7.5});
  txt(ax,10,(T+B)/2,'Latitude',{'text-anchor':'middle','font-size':7.5,transform:'rotate(-90 10 '+(T+B)/2+')'});
  var big=document.body.classList.contains('portrait'), kw={'font-size':big?10.5:8.2,'font-weight':700,fill:'#0B2A4A'};
  P.forEach(function(p,i){
    var x=X(p[1]),y=Y(p[2]),tx=X(p[4]),ty=Y(p[5]);
    var g=el('g',{'class':'mk',style:'--d:'+(i*90+300)+'ms'},s);
    if(p[7])el('line',{x1:tx,y1:ty,x2:x,y2:y,stroke:'#0B2A4A','stroke-width':.7},g);
    el('circle',{cx:x,cy:y,r:4.2,fill:p[3]==='o'?'#E8622D':'#0B2A4A',stroke:'#fff','stroke-width':1.2},g);
    txt(g,tx+(p[7]?(p[6]==='end'?-2:2):0),ty+3,p[0],Object.assign({'text-anchor':p[6]},kw));
  });
  el('rect',{id:'s2zoom',x:X(-98.75),y:Y(32.7),width:X(-89.3)-X(-98.75),height:Y(25.6)-Y(32.7),fill:'none',stroke:'none'},s);
  el('rect',{x:X(META[1])-4,y:Y(META[2])-4,width:8,height:8,fill:'#E8622D'},s);
  txt(s,X(META[1])+8,Y(META[2])-6,META[0],kw);
  el('path',{d:star(X(HUB.lon),Y(HUB.lat),9.5,4),fill:'#E8622D',stroke:'#0B2A4A','stroke-width':1.1},s);
  txt(s,X(-95.45),Y(29.67)+3,HUB.n,{'text-anchor':'end','font-size':big?11.5:9.6,'font-weight':700,fill:'#E8622D'});
}

/* ---------- layout ---------- */
var portrait=false, vw=0, vh=0, BAR=70;
function layout(){
  vw=window.innerWidth; vh=window.innerHeight;
  portrait = vw/vh < 0.85;
  var was=document.body.classList.contains('portrait');
  document.body.classList.toggle('portrait',portrait);
  if(was!==portrait||!document.getElementById('s2zoom'))drawS2Map();
  BAR = OG?0:(vh<500?52:70);
  document.body.classList.toggle('short',vh<500);
  slides.forEach(function(s){
    var x=+s.dataset.x,y=+s.dataset.y,sc=+s.dataset.s,r=+s.dataset.r;
    var w=s.offsetWidth,h=s.offsetHeight;
    s._w=w;s._h=h;
    s.style.left=(x-w/2)+'px'; s.style.top=(y-h/2)+'px';
    s.style.transform='rotate('+r+'deg) scale('+sc+')';
  });
  // route + badges
  var route=document.getElementById('route'), badges=document.getElementById('badges');
  route.innerHTML='';badges.innerHTML='';
  var d='';
  slides.forEach(function(s,i){var x=+s.dataset.x,y=+s.dataset.y;
    if(i===0)d='M'+x+' '+y;else{var p=slides[i-1],px=+p.dataset.x,py=+p.dataset.y,mx=(px+x)/2,my=(py+y)/2-500;d+=' Q'+mx+' '+my+' '+x+' '+y;}});
  el('path',{d:d,fill:'none',stroke:'#E8622D','stroke-width':14,'stroke-dasharray':'50 40',opacity:.7},route);
  slides.forEach(function(s,i){var sc=+s.dataset.s,x=+s.dataset.x-s._w*sc/2,y=+s.dataset.y-s._h*sc/2;
    var g=el('g',{},badges);
    el('circle',{cx:x,cy:y,r:110,fill:'#E8622D',stroke:'#fff','stroke-width':14},g);
    txt(g,x,y+44,String(i+1),{'font-size':125,'font-weight':700,fill:'#fff','text-anchor':'middle'});});
}

/* ---------- steps (slides + Prezi-style sub-zooms) ---------- */
var steps=[];
function buildSteps(){
  steps=[];
  slides.forEach(function(s,i){
    steps.push({slide:i});
    [].forEach.call(s.querySelectorAll('[data-zoom]'),function(wrap){
      var r=document.getElementById(wrap.dataset.zoom), svg=wrap.querySelector('svg');
      var vb=svg.viewBox.baseVal, k=wrap.clientWidth/vb.width, bb=r.getBBox();
      var lx=wrap.offsetLeft+bb.x*k, ly=wrap.offsetTop+bb.y*k, w=bb.width*k, hh=bb.height*k;
      steps.push({slide:i,sub:true,cx:lx+w/2,cy:ly+hh/2,w:w,h:hh});
    });
  });
}
/* ---------- camera ---------- */
var cam={x:6000,y:4100,z:.1,r:0};
function availW(){return vw-(portrait?12:40);} function availH(){return vh-BAR-(portrait?12:30);}
function camFor(i){var st=steps[i],s=slides[st.slide],sc=+s.dataset.s,r=+s.dataset.r;
  if(st.sub){var a=r*Math.PI/180,vx=(st.cx-s._w/2)*sc,vy=(st.cy-s._h/2)*sc;
    var z2=Math.min(availW()/(st.w*sc),availH()/(st.h*sc))*(portrait?0.98:0.78);
    return {x:+s.dataset.x+vx*Math.cos(a)-vy*Math.sin(a),y:+s.dataset.y+vx*Math.sin(a)+vy*Math.cos(a),z:z2,r:r};}
  var z=Math.min(availW()/(s._w*sc),availH()/(s._h*sc));
  if(OG)z=Math.max(vw/(s._w*sc),vh/(s._h*sc));
  if(!portrait)z=Math.min(z,2.2/sc);
  return {x:+s.dataset.x,y:+s.dataset.y,z:z,r:r};}
function camOverview(){var x0=500,x1=11400,y0=250,y1=8100;
  var z=Math.min(vw/(x1-x0),(vh-BAR)/(y1-y0))*0.98;
  if(portrait){x0=600;x1=11200;y0=650;y1=7900;z=Math.min(vw/(x1-x0),(vh-BAR)/(y1-y0))*0.98;}
  return {x:(x0+x1)/2,y:(y0+y1)/2,z:z,r:0};}
function apply(c){
  var cy=OG?vh/2-Math.max(0,(slides[0]._h*(+slides[0].dataset.s)*c.z-vh)/2):(vh-BAR)/2+(portrait?4:8);
  var t='translate('+vw/2+'px,'+cy+'px) scale('+c.z+') rotate('+(-c.r)+'deg) translate('+(-c.x)+'px,'+(-c.y)+'px)';
  world.style.transform=t;
  par.style.transform='translate('+vw/2+'px,'+cy+'px) scale('+(c.z*0.8)+') rotate('+(-c.r*0.6)+'deg) translate('+(-c.x*0.9)+'px,'+(-c.y*0.9)+'px)';
  cam=c;
}
function zoomInterp(a,b){ // van Wijk & Nuij smooth zoom, as in d3.interpolateZoom
  var rho=1.35,rho2=rho*rho,rho4=rho2*rho2;
  var W=availW(),w0=W/a.z,w1=W/b.z,dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,S,fn;
  if(d2<1e-6){S=Math.log(w1/w0)/rho;fn=function(t){return [a.x+t*dx,a.y+t*dy,w0*Math.exp(rho*t*S)];};}
  else{var d1=Math.sqrt(d2),b0=(w1*w1-w0*w0+rho4*d2)/(2*w0*rho2*d1),b1=(w1*w1-w0*w0-rho4*d2)/(2*w1*rho2*d1),
    r0=Math.log(Math.sqrt(b0*b0+1)-b0),r1=Math.log(Math.sqrt(b1*b1+1)-b1);S=(r1-r0)/rho;
    fn=function(t){var s=t*S,c0=Math.cosh(r0),u=w0/(rho2*d1)*(c0*Math.tanh(rho*s+r0)-Math.sinh(r0));return [a.x+u*dx,a.y+u*dy,w0*c0/Math.cosh(rho*s+r0)];};}
  return {S:Math.abs(S),at:function(t){var v=fn(t);return {x:v[0],y:v[1],z:W/v[2],r:a.r+(b.r-a.r)*ease(t)};}};
}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
var flight=null;
function flyTo(target,done){
  if(flight)cancelAnimationFrame(flight.raf);
  if(REDUCED){apply(target);done&&done();return;}
  var zi=zoomInterp(cam,target), dur=Math.max(900,Math.min(2600,700+zi.S*520)), t0=null;
  world.classList.add('flying');
  flight={};
  function f(ts){if(t0===null)t0=ts;var u=Math.min(1,(ts-t0)/dur);apply(zi.at(ease(u)));
    if(u<1)flight.raf=requestAnimationFrame(f);else{flight=null;world.classList.remove('flying');apply(target);done&&done();}}
  flight.raf=requestAnimationFrame(f);
}

/* ---------- navigation ---------- */
var cur=-1, overview=false;
var prog=document.querySelector('#progress i'), count=document.getElementById('count');
function go(i,opts){
  i=Math.max(0,Math.min(steps.length-1,i)); opts=opts||{};
  var dir=i>=cur?1:-1, prevStep=cur, prevSlide=cur>=0?steps[cur].slide:-1, si=steps[i].slide;
  overview=false; document.body.classList.remove('overview');
  slides.forEach(function(s,k){if(k!==si)s.classList.remove('on','active','pre');});
  cur=i; prog.style.width=((i+1)/steps.length*100)+'%'; count.textContent=(si+1)+' / '+N;
  if(history.replaceState)history.replaceState(null,'','#'+(si+1));
  if(prevStep!==i&&!opts.instant)miniSwing(dir);
  var s=slides[si]; s.classList.add('active');
  var fresh=prevSlide!==si;
  if(fresh&&!REDUCED){s.classList.remove('on');s.classList.add('pre');void s.offsetWidth;}
  var arrive=function(){s.classList.add('on'); if(si===0)startIntro();};
  if(opts.instant){apply(camFor(i));arrive();}
  else { if(fresh)setTimeout(function(){ if(cur===i&&!overview) s.classList.add('on'); }, REDUCED?0:600); flyTo(camFor(i),arrive); }
}
function goSlide(n,opts){for(var k=0;k<steps.length;k++)if(steps[k].slide===n&&!steps[k].sub)return go(k,opts);}
function showOverview(){
  overview=true; document.body.classList.add('overview');
  count.textContent='Overview'; flyTo(camOverview());
}
function next(){ if(overview)go(cur<0?0:cur); else if(cur<steps.length-1)go(cur+1); else showOverview(); }
function prev(){ if(overview)go(cur<0?0:cur); else if(cur>0)go(cur-1); }
window.addEventListener('keydown',function(e){
  var k=e.key;
  if(k==='ArrowRight'||k==='ArrowDown'||k===' '||k==='PageDown'||k==='Enter'){e.preventDefault();next();}
  else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||k==='Backspace'){e.preventDefault();prev();}
  else if(k==='Home')go(0); else if(k==='End')go(steps.length-1);
  else if(k==='o'||k==='O'||k==='Escape'){overview?go(cur<0?0:cur):showOverview();}
  else if(/^[0-9]$/.test(k)){goSlide(k==='0'?9:+k-1);}
  hideHint();
});
document.getElementById('next').addEventListener('click',function(e){e.stopPropagation();next();hideHint();});
document.getElementById('prev').addEventListener('click',function(e){e.stopPropagation();prev();hideHint();});
document.getElementById('ovBtn').addEventListener('click',function(e){e.stopPropagation();overview?go(cur):showOverview();hideHint();});
var vp=document.getElementById('viewport'), ps=null;
vp.addEventListener('pointerdown',function(e){ps={x:e.clientX,y:e.clientY,t:Date.now()};});
vp.addEventListener('pointerup',function(e){
  if(!ps)return; var dx=e.clientX-ps.x,dy=e.clientY-ps.y; ps=null;
  hideHint();
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){dx<0?next():prev();return;}
  if(Math.abs(dy)>50){dy<0?next():prev();return;}
  if(Math.abs(dx)>10||Math.abs(dy)>10)return;
  var t=e.target, s=t.closest&&t.closest('.slide');
  if(t.closest&&t.closest('#introCrane')&&!overview){replayIntro();return;}
  var idx=s?slides.indexOf(s):-1;
  if(overview){ if(idx>=0)goSlide(idx); return; }
  if(idx>=0&&idx!==steps[cur].slide){goSlide(idx);return;}
  if(e.clientX<vw*0.3)prev(); else next();
});
vp.addEventListener('wheel',function(e){e.preventDefault();},{passive:false});
var hint=document.getElementById('hint'), hintT=setTimeout(hideHint,5000);
function hideHint(){hint.classList.add('gone');}
var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){layout();buildSteps();if(overview)apply(camOverview());else if(cur>=0)apply(camFor(cur));},120);});

/* ---------- cranes ---------- */
var C=window.KMACrane;
var intro=new C.Crane(document.getElementById('introCrane'),{groundX:[-700,420]});
var PICK={x:0,a:64,e:1,k:1}; var tipPick=intro.tip(PICK), hG=intro.groundHook(PICK);
var SET={x:-150,a:48,e:1,k:0.6}; var tipSet=intro.tip(SET), hS=intro.groundHook(SET);
el('rect',{x:tipSet.x-76,y:-5,width:152,height:5,'class':'cr-pad'},intro.root);
var tl=new C.Timeline(intro,{x:-520,a:12,e:0,h:44,k:1,att:0,sway:0,loadX:tipPick.x},[
  {t0:0,t1:2.8,to:{x:0}},
  {t0:2.5,t1:4.1,to:{a:64}},
  {t0:4.1,t1:5.3,to:{e:1}},
  {t0:5.3,t1:6.7,to:{h:hG}},
  {t0:6.7,t1:7.1,to:{att:1}},
  {t0:7.2,t1:8.7,to:{h:hG-180}},
  {t0:8.7,t1:10.7,to:{k:SET.k,a:SET.a}},
  {t0:8.9,t1:11.0,to:{x:SET.x}},
  {t0:8.7,t1:11.6,linear:true,to:{sway:function(u){return 7*Math.sin(u*Math.PI*3)*(1-u);}}},
  {t0:10.9,t1:12.2,to:{h:hS}},
  {t0:12.2,t1:12.2,to:{loadX:tipSet.x}},
  {t0:12.25,t1:12.6,to:{att:0}},
  {t0:12.7,t1:13.7,to:{h:150,a:60}}
]);
window.__craneDur=tl.dur;
var introPlayed=false;
function startIntro(){ if(introPlayed)return; introPlayed=true; if(REDUCED){tl.seek(tl.dur);return;} tl.play(); }
function replayIntro(){ if(REDUCED)return; tl.stop(); tl.play(); }
tl.seek(0);

var mini=new C.Crane(document.getElementById('miniCrane'),{groundX:[-200,200]});
var mpose={x:0,a:60,e:.3,h:62,k:1,att:1,sway:0,loadX:0}; mini.set(mpose);
var mraf=null;
function miniSwing(dir){
  if(REDUCED)return; cancelAnimationFrame(mraf);
  var k0=mini.pose.k, k1=dir>0?-1:1; if(Math.abs(k0-k1)<.01)k1=-k0;
  var t0=null,D=1400;
  function f(ts){if(t0===null)t0=ts;var u=Math.min(1,(ts-t0)/D),e=ease(u);
    mini.set({k:k0+(k1-k0)*e,h:62-40*Math.sin(Math.PI*u),a:60+6*Math.sin(Math.PI*u),sway:10*Math.sin(u*Math.PI*2.5)*(1-u)});
    if(u<1)mraf=requestAnimationFrame(f);}
  mraf=requestAnimationFrame(f);
}

/* ---------- boot ---------- */
drawCanvas(); layout(); buildSteps();
if(OG){document.getElementById('hud').style.display='none';}
var h=parseInt((location.hash||'').replace('#',''),10);
window.__presi={go:go,goSlide:goSlide,steps:function(){return steps;},overview:showOverview,seekCrane:function(t){introPlayed=true;tl.stop();tl.seek(t);},cam:function(){return cam;},
  flying:function(){return !!flight;},miniSwing:miniSwing,mini:mini};
if(OG||Q.has('crane')){ go(0,{instant:true}); var t=Q.has('crane')?+Q.get('crane'):9.6; introPlayed=true; tl.stop(); tl.seek(t); }
else if(h>=1&&h<=N){ goSlide(h-1,{instant:true}); }
else if(REDUCED){ go(0,{instant:true}); }
else { apply(camOverview()); setTimeout(function(){go(0);},900); }
})();
