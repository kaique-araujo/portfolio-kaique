const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;
const cols = 4, keyMap = {'d':0,'f':1,'j':2,'k':3}, colWidth = W/cols, hitY=H-110;
let notes=[], lastTime=0, running=false, score=0, combo=0, hits=0, totalAttempts=0;
let speed=200, spawnInterval=650, lastSpawn=0, lives=3, player='';
let particles = [];

const scoreEl=document.getElementById('score'), comboEl=document.getElementById('combo'), accEl=document.getElementById('acc'), livesEl=document.getElementById('lives');
const pauseBtn=document.getElementById('pauseBtn'), overlay=document.getElementById('gameOverOverlay');
const menuStart=document.getElementById('menuStart'), menuRanking=document.getElementById('menuRanking');
const menu=document.getElementById('menu');

const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
function playBeep(freq=440,time=0.05){const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type='sine';o.frequency.value=freq;g.gain.value=0.08;o.start();g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+time);setTimeout(()=>o.stop(),time*1000+20);}

function resetGame(){notes=[];particles=[];score=0;combo=0;hits=0;totalAttempts=0;lives=3;speed=200;spawnInterval=650;lastSpawn=0;updateUI();overlay.classList.add('hidden');overlay.innerHTML='';}
function startGame(){resetGame();running=true;lastTime=performance.now();menu.classList.add('hidden');document.getElementById('ranking').classList.add('hidden');document.getElementById('gameArea').classList.remove('hidden');requestAnimationFrame(loop);if(audioCtx.state==='suspended')audioCtx.resume();}
function endGame(){running=false;saveRanking();overlay.innerHTML=`<div>Você perdeu! Pontuação: ${score}</div><button onclick='startGame()'>Jogar Novamente</button><button onclick='showMenu()'>Voltar ao menu</button>`;overlay.classList.remove('hidden');}
function pauseGame(){running=!running;if(!running){overlay.innerHTML=`<div>Jogo pausado</div><button onclick='resumeGame()'>Continuar</button><button onclick='showMenu()'>Menu</button>`;overlay.classList.remove('hidden');}else{overlay.classList.add('hidden');lastTime=performance.now();requestAnimationFrame(loop);}}
function resumeGame(){pauseGame();}

pauseBtn.addEventListener('click',pauseGame);
menuStart.addEventListener('click',()=>{const name=document.getElementById('playerName').value.trim();if(name){player=name;startGame();}else alert('Insira seu nome para jogar!');});
menuRanking.addEventListener('click',showRanking);

function showMenu(){menu.classList.remove('hidden');document.getElementById('gameArea').classList.add('hidden');document.getElementById('ranking').classList.add('hidden');overlay.classList.add('hidden');}
function showRanking(){const rankingList=document.getElementById('rankingList');rankingList.innerHTML='';const ranking=JSON.parse(localStorage.getItem('ranking')||'[]');ranking.sort((a,b)=>b.score-a.score);ranking.slice(0,10).forEach(r=>{const li=document.createElement('li');li.textContent=r.name+": "+r.score;rankingList.appendChild(li);});menu.classList.add('hidden');document.getElementById('gameArea').classList.add('hidden');document.getElementById('ranking').classList.remove('hidden');}
function saveRanking(){const ranking=JSON.parse(localStorage.getItem('ranking')||'[]');ranking.push({name:player,score});localStorage.setItem('ranking',JSON.stringify(ranking));}

function handleHit(col){let best=null,bestDist=Infinity;for(const n of notes){if(n.col!==col||n.hit)continue;const d=Math.abs((n.y+n.h)-hitY);if(d<bestDist){bestDist=d;best=n;}}totalAttempts++;if(best&&bestDist<=Math.max(32,0.08*H)){best.hit=true;const points=combo+1;score+=points;combo++;hits++;spawnParticles(best.col*colWidth+colWidth/2, hitY, col);playBeep(700+col*40,0.07);}else combo=0;updateUI();}

function spawnParticles(x, y, col){for(let i=0;i<10;i++){particles.push({x,y,dx:(Math.random()-0.5)*4,dy:(Math.random()-1)*4,r:4,color:`hsl(${col*90+Math.random()*40},100%,60%)`,life:30});}}
function updateParticles(){for(const p of particles){p.x+=p.dx;p.y+=p.dy;p.dy+=0.1;p.life--;}particles=particles.filter(p=>p.life>0);}
function drawParticles(){for(const p of particles){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();}}

document.getElementById('touchRow').addEventListener('touchstart',(e)=>{e.preventDefault();for(const t of e.changedTouches){const el=document.elementFromPoint(t.clientX,t.clientY);if(el && el.dataset && el.dataset.col)handleHit(Number(el.dataset.col));}},{passive:false});
canvas.addEventListener('mousedown',(e)=>{const rect=canvas.getBoundingClientRect();handleHit(Math.floor((e.clientX-rect.left)/colWidth));});
window.addEventListener('keydown',(e)=>{const k=e.key.toLowerCase();if(k in keyMap){handleHit(keyMap[k]);playBeep(600+keyMap[k]*60,0.07);}if(e.key===' '){e.preventDefault();pauseGame();}});

function spawnRandom(){const r=Math.random();if(r<0.12){let c1=Math.floor(Math.random()*cols),c2=Math.floor(Math.random()*cols);if(c2===c1)c2=(c2+1)%cols;notes.push(makeNote(c1));notes.push(makeNote(c2));}else notes.push(makeNote(Math.floor(Math.random()*cols)));}
function makeNote(col){return {col,y:-40,h:30,speed,hit:false,born:performance.now()};}
function loop(t){if(!running)return;const dt=(t-lastTime)/1000;lastTime=t;lastSpawn+=dt*1000;if(lastSpawn>spawnInterval){spawnRandom();lastSpawn=0;if(spawnInterval>260)spawnInterval*=0.995;speed+=0.05;}for(const n of notes)n.y+=n.speed*dt;for(const n of notes){if(!n.hit&&(n.y+n.h>H)){n.hit=true;combo=0;totalAttempts++;lives--;if(lives<=0){endGame();return;}updateUI();}}notes=notes.filter(n=>!(n.hit&&n.y>H+80));updateParticles();render();requestAnimationFrame(loop);}
function updateUI(){scoreEl.textContent=score;comboEl.textContent=combo;livesEl.textContent=lives;const acc=totalAttempts?Math.round((hits/totalAttempts)*100):100;accEl.textContent=acc+'%';}
function render(){ctx.fillStyle='rgba(30,30,50,0.9)';ctx.fillRect(0,0,W,H);for(let i=0;i<cols;i++){const x=i*colWidth;ctx.fillStyle=(i%2===0)?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.03)';roundRect(ctx,x+6,6,colWidth-12,H-12,12,true,false);}ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(6,hitY,W-12,6);for(const n of notes){const x=n.col*colWidth+12,width=colWidth-24;if(n.hit)ctx.globalAlpha=0.3;ctx.fillStyle='#9d4edd';roundRect(ctx,x,n.y,width,n.h,8,true,false);ctx.globalAlpha=1.0;}drawParticles();}
function roundRect(ctx,x,y,w,h,r,fill,stroke){if(typeof r==='undefined')r=5;if(typeof r==='number')r={tl:r,tr:r,br:r,bl:r};ctx.beginPath();ctx.moveTo(x+r.tl,y);ctx.lineTo(x+w-r.tr,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r.tr);ctx.lineTo(x+w,y+h-r.br);ctx.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h);ctx.lineTo(x+r.bl,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r.bl);ctx.lineTo(x,y+r.tl);ctx.quadraticCurveTo(x,y,x+r.tl,y);ctx.closePath();if(fill)ctx.fill();if(stroke)ctx.stroke();}
