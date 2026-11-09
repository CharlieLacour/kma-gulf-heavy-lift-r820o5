/* Heavy-lift crawler crane — self-contained SVG line art, driven by a pose timeline. */
(function(){
  var NS='http://www.w3.org/2000/svg';
  function el(tag, attrs, parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
  var LB=300, LF=170, EXT=150;           // base boom, fly section, max extension
  var FX=40, FY=-92;                      // boom foot pin (upper-works coords)
  var GX=-42, GY=-178;                    // gantry top
  var LOAD_W=132, LOAD_H=40, SLING=30, BLOCK=24;

  function lattice(len, h0, h1, step){
    var d='M0 '+(-h0)+' L'+len+' '+(-h1)+' M0 '+h0+' L'+len+' '+h1;
    var n=Math.max(2,Math.round(len/step)), up=true;
    for(var i=0;i<=n;i++){
      var x=len*i/n, h=h0+(h1-h0)*i/n;
      if(i===0) d+=' M'+x+' '+(up?-h:h); else d+=' L'+x+' '+(up?-h:h);
      up=!up;
    }
    return d;
  }

  function Crane(svg, opts){
    opts=opts||{};
    this.svg=svg; this.groundX=opts.groundX||[-600,700];
    var root=el('g',{'class':'crane'},svg); this.root=root;
    el('line',{x1:this.groundX[0],y1:0.5,x2:this.groundX[1],y2:0.5,'class':'cr-ground'},root);
    if(opts.pad){ el('rect',{x:opts.pad[0]-80,y:-4,width:160,height:4,'class':'cr-pad'},root); }
    // load (drawn in root coords)
    this.loadG=el('g',{'class':'cr-load'},root);
    this.slings=el('path',{'class':'cr-sling',d:''},root);
    var lg=el('g',{},this.loadG); this.loadInner=lg;
    el('rect',{x:-LOAD_W/2,y:-LOAD_H/2,width:LOAD_W,height:LOAD_H,rx:LOAD_H/2,'class':'cr-vessel'},lg);
    el('line',{x1:-LOAD_W/2+26,y1:-LOAD_H/2,x2:-LOAD_W/2+26,y2:LOAD_H/2,'class':'cr-band'},lg);
    el('line',{x1:LOAD_W/2-26,y1:-LOAD_H/2,x2:LOAD_W/2-26,y2:LOAD_H/2,'class':'cr-band'},lg);
    el('line',{x1:-LOAD_W/2+20,y1:0,x2:LOAD_W/2-20,y2:0,'class':'cr-thin'},lg);
    // lower works (crawler)
    this.lower=el('g',{},root);
    this.track=el('rect',{x:-112,y:-46,width:224,height:46,rx:23,'class':'cr-track'},this.lower);
    el('rect',{x:-112,y:-46,width:224,height:46,rx:23,'class':'cr-track-outline'},this.lower);
    this.rollers=[];
    for(var i=0;i<5;i++){
      var g=el('g',{},this.lower), cx=-88+i*44;
      el('circle',{cx:0,cy:0,r:i===0||i===4?17:12,'class':'cr-roller'},g);
      el('path',{d:'M-9 0 L9 0 M0 -9 L0 9','class':'cr-thin'},g);
      this.rollers.push({g:g,x:cx,y:-23,r:i===0||i===4?17:12});
    }
    el('rect',{x:-44,y:-64,width:88,height:18,'class':'cr-fill'},this.lower);
    // upper works (slews: scaled in x)
    this.upper=el('g',{},root);
    el('rect',{x:-128,y:-112,width:36,height:46,'class':'cr-cw'},this.upper);   // counterweight
    el('rect',{x:-96,y:-114,width:150,height:50,'class':'cr-fill'},this.upper); // house
    el('path',{d:'M-90 -104 L40 -104','class':'cr-thin'},this.upper);
    el('rect',{x:44,y:-108,width:34,height:44,'class':'cr-fill'},this.upper);   // cab
    el('rect',{x:52,y:-102,width:20,height:16,'class':'cr-glass'},this.upper);
    el('path',{d:'M-74 -114 L'+GX+' '+GY+' L-12 -114','class':'cr-line'},this.upper); // gantry
    this.luff=el('path',{'class':'cr-wire',d:''},this.upper);
    this.boom=el('g',{},this.upper);
    var cid='crclip'+Math.random().toString(36).slice(2,8);
    var defs=el('defs',{},svg), cp=el('clipPath',{id:cid,clipPathUnits:'userSpaceOnUse'},defs);
    el('rect',{x:LB-8,y:-30,width:EXT+LF+40,height:60},cp);
    this.fly=el('g',{'clip-path':'url(#'+cid+')'},this.boom);
    this.flyInner=el('g',{},this.fly);
    el('path',{d:lattice(LF,8,5,22),'class':'cr-lattice cr-fly'},this.flyInner);
    el('path',{d:lattice(LB,13,8,25),'class':'cr-lattice'},this.boom);
    el('circle',{cx:0,cy:0,r:6,'class':'cr-pin'},this.boom);
    this.sheave=el('circle',{cx:LB,cy:0,r:7,'class':'cr-pin'},this.boom);
    // hook (root coords)
    this.hookLine=el('line',{'class':'cr-wire'},root);
    this.block=el('g',{},root);
    el('rect',{x:-8,y:0,width:16,height:16,rx:3,'class':'cr-block'},this.block);
    el('path',{d:'M0 16 L0 20 Q-7 22 -6 28 Q-4 33 2 31','class':'cr-line'},this.block);
    this.pose={x:0,a:60,e:0,h:60,k:1,att:0,sway:0,loadX:200};
    this.render();
  }
  Crane.prototype.tip=function(p){
    var L=LB+p.e*EXT, r=p.a*Math.PI/180;
    return {x:p.x+p.k*(FX+L*Math.cos(r)), y:FY-L*Math.sin(r)};
  };
  Crane.prototype.render=function(){
    var p=this.pose, L=LB+p.e*EXT, r=p.a*Math.PI/180;
    this.lower.setAttribute('transform','translate('+p.x+' 0)');
    this.track.style.strokeDashoffset=String(-p.x*1.0);
    for(var i=0;i<this.rollers.length;i++){var R=this.rollers[i];
      R.g.setAttribute('transform','translate('+R.x+' '+R.y+') rotate('+(p.x/R.r*57.3)+')');}
    this.upper.setAttribute('transform','translate('+p.x+' 0) scale('+(Math.abs(p.k)<0.02?0.02*(p.k<0?-1:1):p.k)+' 1)');
    this.boom.setAttribute('transform','translate('+FX+' '+FY+') rotate('+(-p.a)+')');
    this.flyInner.setAttribute('transform','translate('+(LB-LF+p.e*EXT)+' 0)');
    this.sheave.setAttribute('cx',L);
    var bx=FX+LB*0.97*Math.cos(r), by=FY-LB*0.97*Math.sin(r);
    this.luff.setAttribute('d','M'+GX+' '+GY+' L'+bx+' '+by+' M'+GX+' '+(GY+8)+' L'+(FX+LB*0.6*Math.cos(r))+' '+(FY-LB*0.6*Math.sin(r)));
    var t=this.tip(p), hy=t.y+p.h;
    var sw=p.sway*Math.PI/180, hx=t.x+Math.sin(sw)*p.h, hyy=t.y+Math.cos(sw)*p.h;
    this.hookLine.setAttribute('x1',t.x);this.hookLine.setAttribute('y1',t.y+7);
    this.hookLine.setAttribute('x2',hx);this.hookLine.setAttribute('y2',hyy);
    this.block.setAttribute('transform','translate('+hx+' '+hyy+') rotate('+(-p.sway)+')');
    var lx,ly;
    if(p.att>0){ lx=hx; ly=hyy+BLOCK+SLING+LOAD_H/2; }
    else { lx=p.loadX; ly=-LOAD_H/2; }
    this.loadG.setAttribute('transform','translate('+lx+' '+ly+')');
    this.loadInner.setAttribute('transform','rotate('+(p.att>0?-p.sway*0.6:0)+')');
    if(p.att>0){
      var top=ly-LOAD_H/2+2, by2=hyy+BLOCK+2;
      this.slings.setAttribute('d','M'+hx+' '+by2+' L'+(lx-LOAD_W/2+26)+' '+top+' M'+hx+' '+by2+' L'+(lx+LOAD_W/2-26)+' '+top);
      this.slings.style.opacity=Math.min(1,p.att);
    } else { this.slings.setAttribute('d',''); }
  };
  // hook length needed so that a load hanging from the hook sits on the ground
  Crane.prototype.groundHook=function(p){ var t=this.tip(p); return -t.y-LOAD_H-SLING-BLOCK; };
  Crane.prototype.set=function(o){for(var k in o)this.pose[k]=o[k];this.render();};

  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  // Timeline: array of {t0,t1,from:{},to:{}} applied over base pose
  function Timeline(crane, base, steps){this.c=crane;this.base=base;this.steps=steps;
    this.dur=steps.reduce(function(m,s){return Math.max(m,s.t1);},0);}
  Timeline.prototype.poseAt=function(t){
    var p={};for(var k in this.base)p[k]=this.base[k];
    for(var i=0;i<this.steps.length;i++){var s=this.steps[i];
      if(t<s.t0)continue;
      var u=s.t1>s.t0?Math.min(1,(t-s.t0)/(s.t1-s.t0)):1, e=s.linear?u:ease(u);
      for(var key in s.to){var from=(s.from&&key in s.from)?s.from[key]:p[key];
        p[key]=typeof s.to[key]==='function'?s.to[key](u,p,from):from+(s.to[key]-from)*e;}
    }
    return p;
  };
  Timeline.prototype.seek=function(t){this.c.pose=this.poseAt(t);this.c.render();};
  Timeline.prototype.play=function(onDone){
    var self=this, start=null; cancelAnimationFrame(this.raf);
    function f(ts){ if(start===null)start=ts; var t=(ts-start)/1000;
      self.seek(Math.min(t,self.dur)); if(t<self.dur) self.raf=requestAnimationFrame(f); else if(onDone) onDone(); }
    this.raf=requestAnimationFrame(f);
  };
  Timeline.prototype.stop=function(){cancelAnimationFrame(this.raf);};

  window.KMACrane={Crane:Crane,Timeline:Timeline,ease:ease};
})();
