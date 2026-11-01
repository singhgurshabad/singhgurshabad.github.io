'use strict';
(() => {
 const $=id=>document.getElementById(id);
 if(document.body.dataset.game==='pattern-recall'){
  const symbols=['λ','Σ','π','Δ','Ψ','∞'];
  let selected=[];let moves=0;let pairs=0;let locked=false;let timeout=null;
  function reset(){
   clearTimeout(timeout);selected=[];moves=0;pairs=0;locked=false;
   $('moves').textContent='0';$('pairs').textContent='0 / 6';$('game-status').textContent='Find a matching pair.';
   const deck=[...symbols,...symbols];
   for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
   $('memory-grid').replaceChildren(...deck.map((symbol,index)=>{
    const tile=document.createElement('button');tile.type='button';tile.className='memory-tile';tile.textContent='·';tile.dataset.symbol=symbol;tile.setAttribute('aria-label',`Tile ${index+1}, hidden`);
    tile.addEventListener('click',()=>{
     if(locked||tile.classList.contains('revealed')||tile.classList.contains('matched'))return;
     tile.classList.add('revealed');tile.textContent=symbol;tile.setAttribute('aria-label',`Tile ${index+1}, ${symbol}`);selected.push(tile);
     if(selected.length<2)return;
     moves++;$('moves').textContent=String(moves);
     if(selected[0].dataset.symbol===selected[1].dataset.symbol){
      selected.forEach(t=>{t.classList.add('matched');t.setAttribute('aria-disabled','true');t.setAttribute('aria-label',t.getAttribute('aria-label')+', matched');});selected=[];pairs++;$('pairs').textContent=`${pairs} / 6`;
      $('game-status').textContent=pairs===6?`All pairs found in ${moves} moves. Well played.`:'Pair found. Keep going.';
     }else{
      locked=true;$('game-status').textContent='Not a pair. Try again.';
      timeout=setTimeout(()=>{selected.forEach(t=>{t.classList.remove('revealed');t.textContent='·';t.setAttribute('aria-label',`Tile ${[...t.parentNode.children].indexOf(t)+1}, hidden`);});selected=[];locked=false;},850);
     }
    });return tile;
   }));
  }
  $('restart').addEventListener('click',reset);reset();
 }else{
  const pad=$('signal-pad');let timer=null;let start=0;let times=[];
  function state(name,text){pad.dataset.state=name;pad.textContent=text;}
  function wait(){clearTimeout(timer);state('waiting','Wait for lavender…');$('game-status').textContent='Wait. The signal can arrive at any moment.';timer=setTimeout(()=>{start=performance.now();state('ready','Respond now');$('game-status').textContent='Signal is ready. Respond now.';},1200+Math.random()*2300);}
  function reset(){clearTimeout(timer);times=[];$('round').textContent='0 / 5';$('average').textContent='—';$('results').replaceChildren();state('idle','Start five rounds');$('game-status').textContent='Press the panel to begin. Wait until it turns lavender.';}
  pad.addEventListener('click',()=>{
   if(pad.dataset.state==='waiting'){clearTimeout(timer);state('early','Too early. Try this round again.');$('game-status').textContent='Early response. Press the panel to retry; no round was counted.';return;}
   if(pad.dataset.state==='ready'){
    const elapsed=Math.round(performance.now()-start);times.push(elapsed);
    const item=document.createElement('li');item.textContent=`Round ${times.length}: ${elapsed} ms`;$('results').append(item);
    $('round').textContent=`${times.length} / 5`;$('average').textContent=`${Math.round(times.reduce((a,b)=>a+b,0)/times.length)} ms`;
    if(times.length===5){state('done','Session complete. Play again?');$('game-status').textContent='Five rounds complete. Your average is shown above.';}
    else{state('between','Next round');$('game-status').textContent=`${elapsed} milliseconds. Press the panel when you’re ready for the next round.`;}
   }else{if(pad.dataset.state==='done')reset();wait();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&['ready','waiting'].includes(pad.dataset.state)){clearTimeout(timer);state('early','Round paused. Press to retry.');$('game-status').textContent='Round paused while the page was hidden. No score counted.';}});
  $('restart').addEventListener('click',reset);reset();
 }
})();
