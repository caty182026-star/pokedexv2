const fallbackPokemon = [
  ['bulbasaur','grass','poison'], ['charmander','fire'], ['squirtle','water'], ['pikachu','electric'],
  ['jigglypuff','fairy'], ['meowth','normal'], ['psyduck','water'], ['machop','fighting'],
  ['gastly','ghost'], ['eevee','normal'], ['snorlax','normal'], ['dratini','dragon']
];
const palette = { grass:'#b8d9a5', fire:'#f7b09b', water:'#a8c9eb', electric:'#f5d982', fairy:'#e8b8d1', normal:'#d5d9d4', fighting:'#dfb08e', ghost:'#b9acd9', dragon:'#aab4df', poison:'#d0a7ce' };
let pokemon = []; let activeType = 'all'; let favorites = JSON.parse(localStorage.getItem('dexly-favorites') || '[]'); let favoritesOnly = false;
const grid = document.querySelector('#pokemonGrid');
const imageFor = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const cardCatalog = [{ name:'Charizard ex', set:'Obsidian Flames · Ultra Rare', price:48.75, pokemonId:6 }, { name:'Pikachu VMAX', set:'Vivid Voltage · Secret Rare', price:32.4, pokemonId:25 }, { name:'Umbreon VMAX', set:'Evolving Skies · Alt Art', price:86.2, pokemonId:197 }, { name:'Mew ex', set:'151 · Special Illustration', price:21.9, pokemonId:151 }, { name:'Gengar ex', set:'Temporal Forces · Ultra Rare', price:14.5, pokemonId:94 }, { name:'Eevee promo', set:'Scarlet & Violet · Promo', price:8.25, pokemonId:133 }];
const ultraBeastData = [['nihilego','rock','poison',793], ['buzzwole','bug','fighting',794], ['pheromosa','bug','fighting',795], ['xurkitree','electric',null,796], ['celesteela','steel','flying',797], ['kartana','grass','steel',798], ['guzzlord','dark','dragon',799], ['necrozma','psychic',null,800], ['stakataka','rock','steel',805], ['blacephalon','fire','ghost',806]];
const guardianData = [['tapukoko','electric','fairy',785], ['tapulele','psychic','fairy',786], ['tapubulu','grass','fairy',787], ['tapufini','water','fairy',788]];
const zCrystalData = [{ name:'Normalium Z', type:'Normal', move:'Breakneck Blitz', partner:'Eevee' }, { name:'Firium Z', type:'Fire', move:'Inferno Overdrive', partner:'Litten' }, { name:'Waterium Z', type:'Water', move:'Hydro Vortex', partner:'Popplio' }, { name:'Grassium Z', type:'Grass', move:'Bloom Doom', partner:'Rowlet' }, { name:'Electrium Z', type:'Electric', move:'Gigavolt Havoc', partner:'Pikachu' }, { name:'Fairium Z', type:'Fairy', move:'Twinkle Tackle', partner:'Mimikyu' }, { name:'Pikashunium Z', type:'Electric', move:'10,000,000 Volt Thunderbolt', partner:'Pikachu' }];
let ultraBeastsOnly = false; let guardiansOnly = false;
function regionFor(id) { return id <= 151 ? 'kanto' : id <= 251 ? 'johto' : id <= 386 ? 'hoenn' : id <= 493 ? 'sinnoh' : id <= 649 ? 'unova' : id <= 721 ? 'kalos' : id <= 809 ? 'alola' : id <= 905 ? 'galar' : 'paldea'; }
function makePokemon(item, index) { const [name, type, second, details] = item; const id = index + 1; return { id, name, types:details && details.types ? details.types : [type, ...(second ? [second] : [])], image:imageFor(id), region:regionFor(id), height:details ? `${(details.height / 10).toFixed(1)} m` : '0.7 m', weight:details ? `${(details.weight / 10).toFixed(1)} kg` : '6.9 kg', numericHeight:details && details.height || 7, numericWeight:details && details.weight || 69, abilities:details && details.abilities || [], moves:details && details.moves || [] }; }
function openDialog(dialog) { if (dialog.showModal) dialog.showModal(); else { dialog.setAttribute('open', ''); dialog.className += ' legacy-open'; } }
function closeDialog(dialog) { if (dialog.close) dialog.close(); else { dialog.removeAttribute('open'); dialog.className = dialog.className.replace(' legacy-open', ''); } }
function renderFilters() {
  const types = ['all', ...new Set(pokemon.flatMap(mon => mon.types))];
  document.querySelector('#typeFilters').innerHTML = types.map(type => `<button class="type-filter ${activeType === type ? 'active' : ''}" data-type="${type}">${type === 'all' ? 'All types' : type}</button>`).join('');
}
function render() {
  const query = document.querySelector('#searchInput').value.trim().toLowerCase();
  const region = document.querySelector('#regionFilter').value; const sort = document.querySelector('#sortFilter').value;
  const visible = pokemon.filter(mon => (!query || mon.name.includes(query) || String(mon.id).padStart(3,'0').includes(query)) && (activeType === 'all' || mon.types.includes(activeType)) && (region === 'all' || mon.region === region) && (!favoritesOnly || favorites.includes(mon.id)) && (!ultraBeastsOnly || mon.isUltraBeast) && (!guardiansOnly || mon.isGuardian)).sort((first, second) => sort === 'name' ? first.name.localeCompare(second.name) : sort === 'weight' ? second.numericWeight - first.numericWeight : sort === 'height' ? second.numericHeight - first.numericHeight : first.id - second.id);
  document.querySelector('#resultsTitle').textContent = guardiansOnly ? 'Island Guardians' : ultraBeastsOnly ? 'Ultra Beasts' : favoritesOnly ? 'Your favorites' : region !== 'all' ? `${region} Pokédex` : activeType === 'all' ? 'All Pokémon' : `${activeType} types`;
  document.querySelector('#resultsCount').textContent = `${visible.length} shown`;
  document.querySelector('#countLabel').textContent = favoritesOnly ? favorites.length : pokemon.length;
  grid.innerHTML = visible.map(mon => `<article class="pokemon-card" style="background:${palette[mon.types[0]] || '#d5d9d4'}" data-id="${mon.id}"><button class="favorite ${favorites.includes(mon.id) ? 'saved' : ''}" data-favorite="${mon.id}" aria-label="${favorites.includes(mon.id) ? 'Remove from' : 'Add to'} favorites">${favorites.includes(mon.id) ? '♥' : '♡'}</button><span class="card-number">#${String(mon.id).padStart(3,'0')}</span><h3>${mon.name}</h3><span class="type-pill">${mon.types[0]}</span><img src="${mon.image}" alt="${mon.name}" loading="lazy"></article>`).join('');
  document.querySelector('#emptyState').hidden = visible.length !== 0;
}
function openDetails(id) {
  const mon = pokemon.find(item => item.id === id); if (!mon) return;
  const abilities = mon.abilities.length ? mon.abilities.slice(0,2).join(' · ') : 'Discovering'; const moves = mon.moves.length ? mon.moves.slice(0,3).join(' · ') : 'Explore its moves';
  document.querySelector('#detailContent').innerHTML = `<div class="detail-top" style="--card-color:${palette[mon.types[0]] || '#d5d9d4'}"><img src="${mon.image}" alt="${mon.name}"></div><div class="detail-body"><h2>${mon.name}</h2><div class="detail-meta">#${String(mon.id).padStart(3,'0')} · ${mon.types.join(' / ')} · ${mon.region}</div><div class="detail-stats"><div class="stat"><b>${mon.height}</b><span>Height</span></div><div class="stat"><b>${mon.weight}</b><span>Weight</span></div><div class="stat"><b>${mon.types.length}</b><span>Types</span></div></div><div class="detail-list"><p><b>Abilities</b><span>${abilities}</span></p><p><b>Known moves</b><span>${moves}</span></p></div></div>`;
  openDialog(document.querySelector('#detailDialog'));
}
function toggleFavorites() { favoritesOnly = !favoritesOnly; document.querySelector('#favoritesButton').classList.toggle('saved', favoritesOnly); document.querySelector('#navFavorites').classList.toggle('active', favoritesOnly); const dexNav = document.querySelector('.nav-item.active:not(#navFavorites)'); if (dexNav) dexNav.classList.toggle('active', !favoritesOnly); render(); }
document.querySelector('#typeFilters').addEventListener('click', event => { const button = event.target.closest('[data-type]'); if (button) { activeType = button.dataset.type; renderFilters(); render(); } });
grid.addEventListener('click', event => { const favorite = event.target.closest('[data-favorite]'); if (favorite) { const id = Number(favorite.dataset.favorite); favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]; localStorage.setItem('dexly-favorites', JSON.stringify(favorites)); render(); return; } const card = event.target.closest('[data-id]'); if (card) openDetails(Number(card.dataset.id)); });
document.querySelector('#searchInput').addEventListener('input', () => { document.querySelector('#clearSearch').style.display = document.querySelector('#searchInput').value ? 'block' : 'none'; render(); });
document.querySelector('#clearSearch').addEventListener('click', () => { document.querySelector('#searchInput').value = ''; document.querySelector('#clearSearch').style.display = 'none'; render(); });
document.querySelector('#showAll').addEventListener('click', () => { activeType = 'all'; renderFilters(); render(); });
document.querySelector('#ultraBeastButton').addEventListener('click', () => { ultraBeastsOnly = !ultraBeastsOnly; document.querySelector('#ultraBeastButton').classList.toggle('active', ultraBeastsOnly); render(); });
document.querySelector('#guardianButton').addEventListener('click', () => { guardiansOnly = !guardiansOnly; document.querySelector('#guardianButton').classList.toggle('active', guardiansOnly); render(); });
const crystalDialog = document.querySelector('#crystalDialog');
document.querySelector('#crystalButton').addEventListener('click', () => { document.querySelector('#crystalList').innerHTML = zCrystalData.map(crystal => `<div class="card-row crystal-row"><div class="crystal-gem">◇</div><div><strong>${crystal.name}</strong><span>${crystal.type} type · ${crystal.move}</span><span>Partner: ${crystal.partner}</span></div></div>`).join(''); openDialog(crystalDialog); });
document.querySelector('#closeCrystal').addEventListener('click', () => closeDialog(crystalDialog));
crystalDialog.addEventListener('click', event => { if (event.target === event.currentTarget) closeDialog(crystalDialog); });
document.querySelector('#favoritesButton').addEventListener('click', toggleFavorites); document.querySelector('#navFavorites').addEventListener('click', toggleFavorites); document.querySelector('#closeDialog').addEventListener('click', () => closeDialog(document.querySelector('#detailDialog')));
document.querySelector('#detailDialog').addEventListener('click', event => { if (event.target === event.currentTarget) closeDialog(event.currentTarget); });
pokemon = fallbackPokemon.map(makePokemon); ultraBeastData.forEach(item => { const mon = makePokemon([item[0], item[1], item[2]], item[3] - 1); mon.isUltraBeast = true; pokemon.push(mon); }); guardianData.forEach(item => { const mon = makePokemon([item[0], item[1], item[2]], item[3] - 1); mon.isGuardian = true; pokemon.push(mon); }); renderFilters(); render();
document.querySelector('#regionFilter').addEventListener('change', render); document.querySelector('#sortFilter').addEventListener('change', render);
document.querySelector('#randomButton').addEventListener('click', () => { const card = grid.querySelectorAll('[data-id]')[Math.floor(Math.random() * grid.querySelectorAll('[data-id]').length)]; if (card) openDetails(Number(card.dataset.id)); });
if (!window.fetch) window.fetch = function () { return { then: function () { return this; }, catch: function () {} }; };
fetch('https://pokeapi.co/api/v2/pokemon?limit=151').then(response => response.ok ? response.json() : Promise.reject()).then(data => Promise.all(data.results.map((item, index) => fetch(item.url).then(response => response.json()).then(details => makePokemon([item.name, 'normal', null, { types:details.types.sort((first, second) => first.slot - second.slot).map(type => type.type.name), height:details.height, weight:details.weight, abilities:details.abilities.map(ability => ability.ability.name), moves:details.moves.slice(0,6).map(move => move.move.name) }], index))))).then(data => { ultraBeastData.forEach(item => { const mon = makePokemon([item[0], item[1], item[2]], item[3] - 1); mon.isUltraBeast = true; data.push(mon); }); guardianData.forEach(item => { const mon = makePokemon([item[0], item[1], item[2]], item[3] - 1); mon.isGuardian = true; data.push(mon); }); pokemon = data; renderFilters(); render(); }).catch(() => {});

let cameraStream;
const scanDialog = document.querySelector('#scanDialog');
const preview = document.querySelector('#cameraPreview');
const canvas = document.querySelector('#cameraCanvas');
const placeholder = document.querySelector('#cameraPlaceholder');
const scanResult = document.querySelector('#scanResult');
function showScanEstimate(source) {
  const context = canvas.getContext('2d', { willReadFrequently:true });
  canvas.width = source.videoWidth || source.naturalWidth; canvas.height = source.videoHeight || source.naturalHeight;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data; let red = 0; let green = 0; let blue = 0; let samples = 0;
  for (let index = 0; index < pixels.length; index += 40) { red += pixels[index]; green += pixels[index + 1]; blue += pixels[index + 2]; samples++; }
  const channels = { red:red / samples, green:green / samples, blue:blue / samples };
  const type = channels.red > channels.blue * 1.2 ? 'fire' : channels.green > channels.red * 1.05 ? 'grass' : channels.blue > channels.red * 1.1 ? 'water' : 'normal';
  const match = pokemon.find(mon => mon.types.includes(type)) || pokemon[0];
  scanResult.innerHTML = `<strong>Possible match: ${match.name}</strong><span>Visual estimate · ${match.types.join(' / ')} type · Tap a card for details.</span>`;
  scanResult.hidden = false;
}
async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { scanResult.innerHTML = '<strong>Camera unavailable</strong><span>Choose a photo from your device instead.</span>'; scanResult.hidden = false; return; }
  try { cameraStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' } }, audio:false }); preview.srcObject = cameraStream; placeholder.hidden = true; document.querySelector('#startCamera').hidden = true; document.querySelector('#captureImage').hidden = false; }
  catch { scanResult.innerHTML = '<strong>Camera permission needed</strong><span>Allow camera access, or choose a photo below.</span>'; scanResult.hidden = false; }
}
function stopCamera() { if (cameraStream) cameraStream.getTracks().forEach(track => track.stop()); cameraStream = null; preview.srcObject = null; }
document.querySelector('#scanButton').addEventListener('click', () => { openDialog(scanDialog); startCamera(); });
document.querySelector('#startCamera').addEventListener('click', startCamera);
document.querySelector('#captureImage').addEventListener('click', () => showScanEstimate(preview));
document.querySelector('#photoInput').addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; const image = new Image(); image.onload = () => showScanEstimate(image); image.src = URL.createObjectURL(file); });
document.querySelector('#closeScan').addEventListener('click', () => { stopCamera(); closeDialog(scanDialog); });
scanDialog.addEventListener('click', event => { if (event.target === event.currentTarget) { stopCamera(); closeDialog(scanDialog); } });

const aiDialog = document.querySelector('#aiDialog');
const chatLog = document.querySelector('#chatLog');
const chatInput = document.querySelector('#chatInput');
function addChatMessage(message, role) { const bubble = document.createElement('div'); bubble.className = `chat-bubble ${role}`; bubble.textContent = message; chatLog.appendChild(bubble); chatLog.scrollTop = chatLog.scrollHeight; }
function answerQuestion(question) {
  const normalized = question.toLowerCase();
  const mentioned = pokemon.find(mon => normalized.includes(mon.name));
  if (mentioned) return `${mentioned.name} is a ${mentioned.types.join(' and ')} type Pokémon. It is #${String(mentioned.id).padStart(3,'0')} in this Pokédex.`;
  if (normalized.includes('starter') || normalized.includes('begin')) return 'Try Bulbasaur for an easy start, Charmander for a challenge, or Squirtle for a steady run.';
  if (normalized.includes('strong') || normalized.includes('against') || normalized.includes('weak')) return 'For quick type help: Water beats Fire, Fire beats Grass, and Grass beats Water. Electric is strong against Water.';
  if (normalized.includes('team') || normalized.includes('recommend')) return 'Build a balanced team with Water, Fire, Grass, Electric, and a flexible Normal type like Eevee.';
  if (normalized.includes('favorite') || normalized.includes('best')) return 'Pikachu is a classic favorite. Open any card to explore its details, then tap the heart to save it.';
  return 'I can tell you about a Pokémon, explain type matchups, or suggest a starter. Try asking “Tell me about Eevee”.';
}
function submitQuestion(question) { const trimmed = question.trim(); if (!trimmed) return; addChatMessage(trimmed, 'user'); chatInput.value = ''; window.setTimeout(() => addChatMessage(answerQuestion(trimmed), 'assistant'), 180); }
document.querySelector('#aiButton').addEventListener('click', () => { openDialog(aiDialog); playPokedexChime(false); chatInput.focus(); });
document.querySelector('#closeAi').addEventListener('click', () => closeDialog(aiDialog));
aiDialog.addEventListener('click', event => { if (event.target === event.currentTarget) closeDialog(event.currentTarget); });
document.querySelector('#chatForm').addEventListener('submit', event => { event.preventDefault(); submitQuestion(chatInput.value); });
document.querySelector('.suggestions').addEventListener('click', event => { const button = event.target.closest('[data-prompt]'); if (button) submitQuestion(button.dataset.prompt); });

let voiceEnabled = false;
let recognition;
let audioContext;
const voiceToggle = document.querySelector('#voiceToggle');
const voiceStatus = document.querySelector('#voiceStatus');
const micButton = document.querySelector('#micButton');
function playPokedexChime(replyTone) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return;
  audioContext = audioContext || new AudioContextClass(); if (audioContext.state === 'suspended') audioContext.resume();
  const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); const start = audioContext.currentTime;
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(replyTone ? 660 : 520, start); oscillator.frequency.exponentialRampToValueAtTime(replyTone ? 990 : 780, start + 0.12);
  gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
  oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(start); oscillator.stop(start + 0.25);
}
function speakReply(message) { if (!voiceEnabled || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message); utterance.rate = 0.96; utterance.pitch = 1.05; window.speechSynthesis.speak(utterance); }
const originalAddChatMessage = addChatMessage;
addChatMessage = (message, role) => { originalAddChatMessage(message, role); if (role === 'assistant') { playPokedexChime(true); speakReply(message); } };
voiceToggle.addEventListener('click', () => { voiceEnabled = !voiceEnabled; voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇'; voiceToggle.classList.toggle('on', voiceEnabled); voiceToggle.setAttribute('aria-label', voiceEnabled ? 'Turn AI voice off' : 'Turn AI voice on'); voiceStatus.hidden = !voiceEnabled; if (voiceEnabled) speakReply('Voice replies are on. Ask me anything about Pokémon.'); else if (window.speechSynthesis) window.speechSynthesis.cancel(); });
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1;
  recognition.onstart = () => { micButton.classList.add('listening'); micButton.textContent = '◼'; };
  recognition.onresult = event => { chatInput.value = event.results[0][0].transcript; submitQuestion(chatInput.value); };
  recognition.onend = () => { micButton.classList.remove('listening'); micButton.textContent = '●'; };
  recognition.onerror = () => { micButton.classList.remove('listening'); micButton.textContent = '●'; };
} else { micButton.hidden = true; }
micButton.addEventListener('click', () => { if (!recognition) return; if (micButton.classList.contains('listening')) recognition.stop(); else recognition.start(); });

const qrDialog = document.querySelector('#qrDialog');
const appUrl = window.location.href;
document.querySelector('#shareButton').addEventListener('click', () => {
  document.querySelector('#qrImage').src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}`;
  document.querySelector('#qrUrl').textContent = appUrl;
  openDialog(qrDialog);
});
document.querySelector('#closeQr').addEventListener('click', () => closeDialog(qrDialog));
qrDialog.addEventListener('click', event => { if (event.target === event.currentTarget) closeDialog(event.currentTarget); });
document.querySelector('#copyUrl').addEventListener('click', async event => { try { await navigator.clipboard.writeText(appUrl); event.currentTarget.textContent = 'Link copied'; window.setTimeout(() => { event.currentTarget.textContent = 'Copy link'; }, 1600); } catch { event.currentTarget.textContent = 'Copy unavailable'; } });

const valueDialog = document.querySelector('#valueDialog');
const cardList = document.querySelector('#cardList');
function renderCards() { const query = document.querySelector('#cardSearch').value.toLowerCase(); const cards = cardCatalog.filter(card => card.name.toLowerCase().includes(query)); document.querySelector('#valueTotal').textContent = `$${cardCatalog.reduce((total, card) => total + card.price, 0).toFixed(2)}`; cardList.innerHTML = cards.map(card => `<div class="card-row"><img src="${imageFor(card.pokemonId)}" alt="${card.name}"><div><strong>${card.name}</strong><span>${card.set}</span></div><b class="card-price">$${card.price.toFixed(2)}</b></div>`).join(''); }
document.querySelector('#valueButton').addEventListener('click', () => { renderCards(); openDialog(valueDialog); });
document.querySelector('#closeValue').addEventListener('click', () => closeDialog(valueDialog));
valueDialog.addEventListener('click', event => { if (event.target === event.currentTarget) closeDialog(valueDialog); });
document.querySelector('#cardSearch').addEventListener('input', renderCards);

let installPrompt;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
document.querySelector('#downloadButton').addEventListener('click', async () => {
  if (installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; return; }
  window.location.href = 'https://github.com/caty182026-star/pokedexv2/archive/refs/heads/main.zip';
});
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));