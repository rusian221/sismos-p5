// Sismos del mundo — Datos, animación y sonido con p5.js
// Fuente: U.S. Geological Survey, Earthquake Hazards Program.
const URL_SISMOS = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson';
let crudo, sismos = [], anillos = [];
let t0 = 0, duracion = 1, indice = 0, ultimoAhora = 0;
let magMin = 5, sonidoActivo = false, pausado = false, tiempoPausa = 0;
let osc, env, onda = 'sine', botonSonido, sliderMag, selectOnda;
let sismoHover = null;

function preload() {
  crudo = loadJSON(URL_SISMOS, () => {}, () => {
    document.getElementById('status').textContent = 'No se pudieron cargar los datos.';
  });
}

function setup() {
  const ancho = min(windowWidth - 36, 1160);
  createCanvas(max(320, ancho), max(180, ancho * 0.5)).parent('canvas-holder');
  textFont('system-ui');
  prepararDatos();
  configurarInterfaz();
  osc = new p5.Oscillator(onda);
  env = new p5.Envelope();
  env.setADSR(0.01, 0.15, 0.1, 0.4);
  env.setRange(0.35, 0);
  osc.amp(env);
  document.getElementById('source').textContent = URL_SISMOS;
}

function prepararDatos() {
  if (!crudo || !Array.isArray(crudo.features)) return;
  sismos = crudo.features.map(f => ({
    lon: Number(f.geometry.coordinates[0]), lat: Number(f.geometry.coordinates[1]),
    prof: Number(f.geometry.coordinates[2]), mag: Number(f.properties.mag),
    lugar: f.properties.place || 'Lugar no disponible', t: Number(f.properties.time)
  })).filter(s => Number.isFinite(s.mag) && Number.isFinite(s.t)).sort((a,b) => a.t-b.t);
  if (sismos.length) { t0 = sismos[0].t; duracion = max(1, sismos.at(-1).t - t0); }
  document.getElementById('status').textContent = `${sismos.length} registros · M ≥ 2.5`;
}

function configurarInterfaz() {
  sliderMag = document.getElementById('mag-slider');
  sliderMag.addEventListener('input', e => { magMin = Number(e.target.value); document.getElementById('mag-value').textContent = magMin.toFixed(1); });
  selectOnda = document.getElementById('wave-select');
  selectOnda.addEventListener('change', e => { onda = e.target.value; if (osc) osc.setType(onda); });
  botonSonido = document.getElementById('sound-button');
  botonSonido.addEventListener('click', alternarSonido);
  document.getElementById('pause-button').addEventListener('click', () => {
    pausado = !pausado; document.getElementById('pause-button').textContent = pausado ? 'Continuar' : 'Pausar';
    if (pausado) tiempoPausa = millis();
  });
  document.getElementById('restart-button').addEventListener('click', reiniciarCiclo);
}

function draw() {
  background(8, 11, 30); dibujarCuadricula();
  if (!sismos.length) { fill(255); textAlign(CENTER, CENTER); text('No hay datos disponibles.', width/2, height/2); return; }
  if (!pausado) actualizarAnimacion();
  dibujarSismos(); dibujarAnillos(); dibujarInterfazCanvas();
}

function actualizarAnimacion() {
  const ahora = t0 + (millis() * duracion / 60000) % duracion;
  if (ahora < ultimoAhora) { indice = 0; anillos = []; }
  ultimoAhora = ahora;
  while (indice < sismos.length && sismos[indice].t <= ahora) {
    const s = sismos[indice++];
    if (s.mag >= magMin) { anillos.push({s, nacio:millis()}); sonar(s); }
  }
}

function dibujarSismos() {
  noStroke();
  for (let i=0; i<indice; i++) {
    const s = sismos[i]; if (s.mag < magMin) continue;
    const p = proyectar(s.lon, s.lat), c = colorProfundidad(s.prof); c.setAlpha(170); fill(c); circle(p.x,p.y,max(2,tamano(s.mag)*0.16));
  }
  sismoHover = encontrarCercano(mouseX, mouseY);
  if (sismoHover) { const p=proyectar(sismoHover.lon,sismoHover.lat); noFill(); stroke(255); strokeWeight(1.5); circle(p.x,p.y,tamano(sismoHover.mag)+10); }
}

function dibujarAnillos() {
  noFill();
  for (let i=anillos.length-1; i>=0; i--) {
    const a=anillos[i], edad=(millis()-a.nacio)/3000;
    if (edad>1) { anillos.splice(i,1); continue; }
    const p=proyectar(a.s.lon,a.s.lat), c=colorProfundidad(a.s.prof); c.setAlpha(255*(1-edad));
    stroke(c); strokeWeight(2); circle(p.x,p.y,tamano(a.s.mag)*(0.3+2*edad));
  }
}

function dibujarInterfazCanvas() {
  const ahora = t0 + (millis() * duracion / 60000) % duracion;
  noStroke(); fill(255); textAlign(LEFT,TOP); textSize(13); text(new Date(ahora).toLocaleDateString('es-CO'),10,10);
  fill(180,190,220); textSize(11); text(`Sismos mostrados: ${sismos.slice(0,indice).filter(s=>s.mag>=magMin).length}`,10,29);
}

function proyectar(lon,lat) { return {x:map(lon,-180,180,0,width), y:map(lat,90,-90,0,height)}; }
function tamano(mag) { return map(constrain(mag,2.5,8),2.5,8,7,78); }
function colorProfundidad(prof) { return lerpColor(color('#ffd166'),color('#7b2cbf'),constrain(prof/300,0,1)); }
function dibujarCuadricula() { stroke(255,22); strokeWeight(1); for(let lon=-180;lon<=180;lon+=30){let x=proyectar(lon,0).x;line(x,0,x,height);} for(let lat=-90;lat<=90;lat+=30){let y=proyectar(0,lat).y;line(0,y,width,y);} }

function encontrarCercano(x,y) {
  let mejor=null, distancia=Infinity;
  for(let i=0;i<indice;i++){const s=sismos[i];if(s.mag<magMin)continue;const p=proyectar(s.lon,s.lat),d=dist(x,y,p.x,p.y);if(d<distancia&&d<18){mejor=s;distancia=d;}}
  const info=document.getElementById('info');
  if(mejor) info.innerHTML=`<strong>${escapeHtml(mejor.lugar)}</strong><br>Magnitud ${mejor.mag.toFixed(1)} · Profundidad ${mejor.prof.toFixed(1)} km · ${new Date(mejor.t).toLocaleString('es-CO')}`;
  else info.textContent='Pasa el cursor sobre un sismo para consultar su lugar, magnitud y profundidad.';
  return mejor;
}
function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function alternarSonido() {
  userStartAudio(); sonidoActivo=!sonidoActivo;
  if(sonidoActivo){ osc.setType(onda); osc.start(); botonSonido.textContent='Silenciar'; }
  else { osc.stop(); botonSonido.textContent='Activar sonido'; }
}
function sonar(s) { if(!sonidoActivo)return; osc.freq(map(s.mag,2.5,8,880,110)); osc.pan(map(s.lon,-180,180,-1,1)); env.play(); }
function reiniciarCiclo() { indice=0; anillos=[]; ultimoAhora=0; }
function windowResized() { const ancho=min(windowWidth-36,1160); resizeCanvas(max(320,ancho),max(180,ancho*0.5)); }
