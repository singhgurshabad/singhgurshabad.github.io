/* A tiny real classifier, not a prerecorded animation. */
(() => {
  const svgNS='http://www.w3.org/2000/svg';
  const group=document.getElementById('model-points');
  const boundary=document.getElementById('decision-boundary');
  const train=document.getElementById('train-model');
  const status=document.getElementById('model-status');
  const lossLabel=document.getElementById('model-loss');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const data=Array.from({length:40},(_,i)=>{
    const label=i%2;
    const x=(label? .65:-.65)+Math.sin(i*2.7)*.38;
    const y=(label? .35:-.35)+Math.cos(i*1.9)*.5;
    const dot=document.createElementNS(svgNS,'circle');
    dot.setAttribute('cx',220+x*125);dot.setAttribute('cy',160-y*100);dot.setAttribute('r','4');
    dot.setAttribute('fill',label?'#f2ead2':'#c6b4f5');group.append(dot);
    return {x,y,label};
  });
  let weights=[0,-.8,0];let steps=0;let running=false;let timer=null;
  const sigmoid=z=>1/(1+Math.exp(-z));
  function render(){
    const [wx,wy,b]=weights;
    const loss=data.reduce((sum,p)=>{const prob=Math.min(1-1e-9,Math.max(1e-9,sigmoid(wx*p.x+wy*p.y+b)));return sum-p.label*Math.log(prob)-(1-p.label)*Math.log(1-prob);},0)/data.length;
    if(Math.abs(wy)>.001){const y=x=>160-(-(wx*x+b)/wy)*100;boundary.setAttribute('d',`M0 ${y(-220/125)}L440 ${y(220/125)}`);}
    lossLabel.textContent=`LOSS ${loss.toFixed(3)}`;
    status.textContent=`${steps===160?'Trained':'Learning'} · ${steps} steps · ${Math.round(data.filter(p=>(sigmoid(wx*p.x+wy*p.y+b)>=.5?1:0)===p.label).length/data.length*100)}% training accuracy`;
  }
  function step(){
    for(let n=0;n<4;n++){
      const gradient=[0,0,0];
      data.forEach(p=>{const error=sigmoid(weights[0]*p.x+weights[1]*p.y+weights[2])-p.label;gradient[0]+=error*p.x;gradient[1]+=error*p.y;gradient[2]+=error;});
      weights=weights.map((w,i)=>w-.3*gradient[i]/data.length);steps++;
    }
    render();
    if(steps<160) timer=setTimeout(step,reduced.matches?0:55);
    else {running=false;train.disabled=false;train.textContent='Train again +';document.querySelector('.model-stage').classList.remove('training');}
  }
  train.addEventListener('click',()=>{if(running)return;clearTimeout(timer);weights=[0,-.8,0];steps=0;running=true;train.disabled=true;document.querySelector('.model-stage').classList.add('training');step();});
  const sword=document.getElementById('sword-dialog');
  const trigger=document.getElementById('sword-trigger');
  trigger.addEventListener('click',()=>sword.showModal());
  document.getElementById('close-sword').addEventListener('click',()=>sword.close());
  sword.addEventListener('close',()=>trigger.focus({preventScroll:true}));
  sword.addEventListener('click',event=>{if(event.target===sword){const b=sword.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)sword.close();}});
})();
