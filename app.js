<!-- File: app.js
   Changes: Remove DuckDuckGo search logic, Use Google CSE for search results -->
document.addEventListener('DOMContentLoaded', async () => {
  await initializeModel();

  // Dati iniziali dei giocatori
  const initialPlayers = [
    {
      name: "Gabriel Sanabria",
      country: "Ecuador",
      year: 2008,
      role: "Central Midfielder",
      club: "Independiente del Valle U17",
      video: "https://twitter.com/scoutecuador/status/1234567890",
      context: "2 assists vs LDU Quito U17 – Copa Mitad del Mundo",
      tags: ["line-breaking pass", "quick turn", "calm under pressure"],
      source: "scout verified",
      rank: "Tattico",
      insight: "Un giocatore che combina visione e lucidità: trova linee di passaggio impossibili, un regista che spezza le difese con visione pura. Si gira con agilità sotto pressione, un talento che crea spazi dove non ce ne sono. Gestisce il gioco con lucidità, un faro che guida la squadra nei momenti cruciali."
    },
  ];

  // Mappa degli insight (bilanciata tra poesia e professionalità)
  const insightMap = {
    "explosive dribbling": { technical: "Efficace in dribbling nello stretto con accelerazioni rapide.", narrative: "Supera gli avversari con un ritmo travolgente, un’ala che illumina il campo con la sua energia." },
    "final pass": { technical: "Precisione elevata nei passaggi decisivi in area avversaria.", narrative: "Conclude l’azione con un passaggio decisivo, un artista che dipinge l’ultimo tocco per il gol." },
    "calm under pressure": { technical: "Mantiene focus e decisione in situazioni di alta pressione.", narrative: "Gestisce il gioco con lucidità, un faro che guida la squadra nei momenti cruciali." },
    "clean tackle": { technical: "Interventi difensivi precisi con minimo rischio di fallo.", narrative: "Interviene con precisione chirurgica, un difensore che domina senza sbavature." },
    "anticipation": { technical: "Ottima lettura del gioco con posizionamento anticipato.", narrative: "Legge il gioco in anticipo, un’intelligenza tattica che anticipa ogni mossa avversaria." },
    "progressive carry": { technical: "Capace di avanzare il pallone con controllo in spazi ristretti.", narrative: "Avanza con controllo e visione, un motore che spinge la squadra verso l’attacco." },
    "quick turn": { technical: "Eccellente agilità nei cambi di direzione sotto pressione.", narrative: "Si gira con agilità sotto pressione, un talento che crea spazi dove non ce ne sono." },
    "line-breaking pass": { technical: "Passaggi verticali efficaci per superare le linee difensive.", narrative: "Trova linee di passaggio impossibili, un regista che spezza le difese con visione pura." },
    "feint": { technical: "Abile nell’usare finte per superare il diretto avversario.", narrative: "Inganna con movimenti eleganti, un dribbling che lascia i difensori fuori posizione." }
  };

  let pipelineLLM = null;

  // Inizializza il modello LLM (T5-small con WASM)
  async function initializeModel() {
    if (!window['@xenova/transformers']) return;
    try {
      const { pipeline } = window['@xenova/transformers'];
      pipelineLLM = await pipeline('text2text-generation', 't5-small', { quantized: false });
    } catch (error) {
      console.error('Error initializing LLM:', error);
    }
  }

  // Estrai dati giocatore con LLM o fallback euristico
  async function extractPlayerDataWithLLM(text) {
    if (!pipelineLLM) return parsePlayerPost(text); // Fallback se LLM non pronto
    try {
      const prompt = `Estrai i seguenti campi da questo testo: name, country, year, role, tags, insight. Testo: ${text}`;
      const result = await pipelineLLM(prompt, { max_length: 100 });
      const output = result[0].generated_text;
      // Parsa il risultato JSON-like (semplificato)
      const data = output.match(/\{.*\}/s)?.[0] || '{}';
      const parsed = JSON.parse(data);
      return {
        name: parsed.name || 'Unknown',
        country: parsed.country || 'Unknown',
        year: parsed.year ? parseInt(parsed.year) : new Date().getFullYear() - 17,
        role: parsed.role || 'Unknown',
        tags: parsed.tags ? parsed.tags.split(',').map(t => t.trim()) : [],
        insight: parsed.insight || generateInsight(parsed.tags || [])
      };
    } catch (error) {
      console.warn('LLM failed, using fallback:', error);
      return parsePlayerPost(text);
    }
  }

  // Gestione salvataggio e caricamento giocatori
  function loadPlayers() {
    return JSON.parse(localStorage.getItem('players')) || initialPlayers;
  }

  function savePlayer(player) {
    const players = loadPlayers();
    if (!isDuplicate(player, players)) {
      players.push(player);
      localStorage.setItem('players', JSON.stringify(players));
    }
  }

  function deletePlayer(index) {
    const players = loadPlayers();
    players.splice(index, 1);
    localStorage.setItem('players', JSON.stringify(players));
  }

  function isDuplicate(newPlayer, existingPlayers) {
    return existingPlayers.some(player => 
      player.name.toLowerCase().includes(newPlayer.name.toLowerCase()) && player.year === newPlayer.year
    );
  }

  // Utility per thumbnail video
  function getVideoThumbnail(video) {
    if (!video) return 'placeholder.png';
    const match = video.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : 'placeholder.png';
  }

  // Display giocatori
  function displayPlayers(countryFilter = '', roleFilter = '', rankFilter = '') {
    const players = loadPlayers();
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    const filteredPlayers = players.filter(player =>
      (!countryFilter || player.country.toLowerCase() === countryFilter.toLowerCase()) &&
      (!roleFilter || player.role.toLowerCase() === roleFilter.toLowerCase()) &&
      (!rankFilter || player.rank.toLowerCase() === rankFilter.toLowerCase())
    );
    if (filteredPlayers.length === 0) {
      playerList.innerHTML = '<li>Nessun talento trovato.</li>';
    } else {
      filteredPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-card';
        li.innerHTML = `
          <h3>${player.name} (${player.country}, ${player.year})</h3>
          <p><strong>Ruolo:</strong> ${player.role}</p>
          <p><strong>Club:</strong> ${player.club || 'N/A'}</p>
          ${player.video ? `<p><strong>Video:</strong> <a href="${player.video}" target="_blank">Guarda</a></p>` : ''}
          ${player.context ? `<p><strong>Contesto:</strong> ${player.context}</p>` : ''}
          <p><strong>Tag:</strong> ${player.tags.join(', ')}</p>
          <p><strong>Fonte:</strong> ${player.source}</p>
          <p><strong>Rank:</strong> ${player.rank}</p>
          <p><strong>Insight:</strong> ${player.insight}</p>
          <button class="delete-btn" data-index="${index}">Elimina</button>
        `;
        playerList.appendChild(li);
      });
      document.querySelectorAll('.delete-btn').forEach(button =>
        button.addEventListener('click', () => {
          deletePlayer(button.dataset.index);
          displayPlayers(countryFilter, roleFilter, rankFilter);
        })
      );
    }
  }

  // Funzione per suggerire tag
  function suggestTags(text) {
    if (!text) return [];
    const words = text.toLowerCase().split(/\W+/);
    const knownTags = Object.keys(insightMap);
    const suggestedTags = new Set();
    words.forEach(word => {
      const matchingTag = knownTags.find(tag => 
        tag.includes(word) || word.includes(tag) || levenshteinDistance(tag, word) < 2
      );
      if (matchingTag) suggestedTags.add(matchingTag);
    });
    return Array.from(suggestedTags).slice(0, 5);
  }

  // Funzione per calcolare la distanza di Levenshtein
  function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[b.length][a.length];
  }

  // Funzione per generare insight (bilanciata per professionalità)
  function generateInsight(tags, style = 'narrative') {
    if (!tags || tags.length === 0) return "Nessun insight disponibile.";
    const insights = tags.map(tag => {
      const entry = insightMap[tag] || { 
        technical: `Abile in ${tag.replace('skill_', '')}.`, 
        narrative: `Un talento emergente in ${tag.replace('skill_', '')}, con qualità da osservare.` 
      };
      return style === 'technical' ? entry.technical : entry.narrative;
    }).filter(Boolean);
    const intro = tags.length > 1 ? "Un giocatore che combina " : "Un talento che spicca per ";
    return intro + insights.join(' ').charAt(0).toLowerCase() + insights.join(' ').slice(1) + ".";
  }

  // Funzione fallback per parsing euristico (usata solo se LLM fallisce)
  function parsePlayerPost(text) {
    if (!text) return null;
    const originalText = text;
    const words = text.toLowerCase().split(/\W+/);

    // Estrazione nome
    const nameMatch = originalText.match(/[A-Z][a-z]+(?: [A-Z][a-z]+)?/);
    const name = nameMatch ? nameMatch[0] : 'Unknown';

    // Estrazione paese
    const countries = ['brazil', 'ecuador', 'south africa', 'argentina', 'spain', 'england', 'france', 'italy', 'germany', 'portugal', 'colombia', 'mexico'];
    const country = words.find(word => countries.includes(word)) || 'Unknown';

    // Estrazione anno
    const yearMatch = originalText.match(/\b(200[5-9])\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear() - 17;

    // Estrazione ruolo
    const roles = ['winger', 'midfielder', 'striker', 'defender', 'goalkeeper', 'forward', 'centre-back', 'centre back', 'attacking midfielder', 'defensive midfielder'];
    const roleMatch = words.find(word => roles.includes(word));
    const role = roleMatch ? roleMatch.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-') : 'Unknown';

    // Estrazione video
    const videoMatch = originalText.match(/(https?:\/\/[^\s]+)/);
    const video = videoMatch ? videoMatch[0] : '';

    // Estrazione contesto
    const contextMatch = originalText.match(/.{1,100}(?:match|game|tournament|goal|assist|dribbling|copa|championship).{1,100}/i);
    const context = contextMatch ? contextMatch[0].trim() : '';

    // Suggerimento tag
    const tags = suggestTags(originalText);
    const insight = generateInsight(tags);

    return {
      name,
      country: country.charAt(0).toUpperCase() + country.slice(1),
      year,
      role,
      tags,
      insight,
      context,
      video,
      source: 'Manual X Post'
    };
  }

  // Analisi del post incollato
  document.getElementById('analyze-post-btn').addEventListener('click', async () => {
    const postText = document.getElementById('scouting-post').value;
    const suggestionsDiv = document.getElementById('scouting-post-suggestions');
    if (postText) {
      const playerData = await extractPlayerDataWithLLM(postText);
      if (playerData) {
        suggestionsDiv.innerHTML = `
          <div class="suggestion-card">
            <h3>Suggerimenti Scout</h3>
            <p><strong>Nome:</strong> ${playerData.name}</p>
            <p><strong>Paese:</strong> ${playerData.country}</p>
            <p><strong>Anno:</strong> ${playerData.year}</p>
            <p><strong>Ruolo:</strong> ${playerData.role}</p>
            ${playerData.video ? `<p><strong>Video:</strong> <a href="${playerData.video}" target="_blank">${playerData.video}</a></p>` : ''}
            ${playerData.context ? `<p><strong>Contesto:</strong> ${playerData.context}</p>` : ''}
            <p><strong>Tag:</strong> ${playerData.tags.join(', ')}</p>
            <p><strong>Insight:</strong> ${playerData.insight}</p>
            <button id="apply-suggestions-btn">Applica al Profilo</button>
          </div>
        `;
        document.getElementById('apply-suggestions-btn').addEventListener('click', () => {
          document.getElementById('name-full').value = playerData.name;
          document.getElementById('country').value = playerData.country;
          document.getElementById('year').value = playerData.year;
          document.getElementById('role').value = playerData.role;
          document.getElementById('video-full').value = playerData.video;
          document.getElementById('context').value = playerData.context;
          document.getElementById('tags').value = playerData.tags.join(', ');
          document.getElementById('insight').value = playerData.insight;
          document.getElementById('source').value = 'Manual X Post';
        });
      } else {
        suggestionsDiv.innerHTML = '<p>Impossibile analizzare il post. Inserisci più dettagli.</p>';
      }
    } else {
      suggestionsDiv.innerHTML = '<p>Incolla un post da X per analizzarlo.</p>';
    }
  });

  // Submit form
  document.getElementById('scout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const player = {
      name: document.getElementById('name-full').value || 'Unknown',
      country: document.getElementById('country').value || 'Unknown',
      year: parseInt(document.getElementById('year').value) || new Date().getFullYear() - 17,
      role: document.getElementById('role').value || 'Unknown',
      club: document.getElementById('club').value || 'Unknown',
      video: document.getElementById('video-full').value || '',
      context: document.getElementById('context').value || '',
      tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
      source: document.getElementById('source').value || 'Manual Entry',
      rank: document.getElementById('rank-full').value || 'Tattico',
      insight: document.getElementById('insight').value || generateInsight(document.getElementById('tags').value.split(',').map(t => t.trim()))
    };
    savePlayer(player);
    displayPlayers(
      document.getElementById('filter-country').value,
      document.getElementById('filter-role').value,
      document.getElementById('filter-rank').value
    );
    e.target.reset();
  });

  // Generazione insight con spinner
  document.getElementById('generate-insight').addEventListener('click', async () => {
    const button = document.getElementById('generate-insight');
    const spinner = button.querySelector('.spinner');
    spinner.style.display = 'inline';
    const tagsInput = document.getElementById('tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(t => t);
    const insightStyle = document.querySelector('input[name="insight-style"]:checked')?.value || 'narrative';
    const insight = await generateInsight(tags, insightStyle);
    document.getElementById('insight').value = insight;
    spinner.style.display = 'none';
  });

  // Filtri
  ['filter-country', 'filter-role', 'filter-rank'].forEach(id =>
    document.getElementById(id).addEventListener('change', () =>
      displayPlayers(
        document.getElementById('filter-country').value,
        document.getElementById('filter-role').value,
        document.getElementById('filter-rank').value
      )
    )
  );

  // Load demo
  document.getElementById('load-demo').addEventListener('click', () => {
    localStorage.setItem('players', JSON.stringify(initialPlayers));
    displayPlayers();
    alert('Demo caricata con successo!');
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    const players = loadPlayers();
    const markdown = players.map(p => `
### ${p.name} (${p.country}, ${p.year})
- **Ruolo**: ${p.role}
- **Club**: ${p.club || 'N/A'}
${p.video ? `- **Video**: [Guarda](${p.video})` : ''}
${p.context ? `- **Contesto**: ${p.context}` : ''}
- **Tag**: ${p.tags.join(', ')}
- **Fonte**: ${p.source}
- **Rank**: ${p.rank}
- **Insight**: ${p.insight}
    `).join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apes_talents.md';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Overlay per CSE_ID
  const cseOverlay = document.getElementById('cse-overlay');
  const cseId = localStorage.getItem('cseId');
  if (!cseId) {
    cseOverlay.style.display = 'block';
  } else {
    injectCSE(cseId);
  }

  document.getElementById('save-cse-id').addEventListener('click', () => {
    const cseIdInput = document.getElementById('cse-id-input').value;
    if (cseIdInput) {
      localStorage.setItem('cseId', cseIdInput);
      injectCSE(cseIdInput);
      cseOverlay.style.display = 'none';
    }
  });

  document.getElementById('cancel-cse-id').addEventListener('click', () => {
    cseOverlay.style.display = 'none';
  });

  function injectCSE(cseId) {
    const script = document.createElement('script');
    script.src = `https://cse.google.com/cse.js?cx=CSE_ID_HERE`; // Sostituisci CSE_ID_HERE con il tuo CSE_ID
    document.body.appendChild(script);
    const gcseDiv = document.querySelector('.gcse-search');
    gcseDiv.style.display = 'block';
  }

  // Aggiungi listener per i risultati di Google CSE
  window.addEventListener('load', () => {
    const searchResultsDiv = document.getElementById('search-results');
    const observer = new MutationObserver(async (mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          const results = document.querySelectorAll('.gsc-result');
          searchResultsDiv.innerHTML = '';
          results.forEach(result => {
            const title = result.querySelector('.gs-title')?.textContent || 'No Title';
            const snippet = result.querySelector('.gs-snippet')?.textContent || '';
            const link = result.querySelector('.gs-title a')?.href || '#';
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result';
            resultDiv.innerHTML = `
              <h4>${title}</h4>
              <p>${snippet}</p>
              <a href="${link}" target="_blank">Vedi fonte</a>
              <button class="create-profile-btn" data-text="${snippet}">Crea Profilo</button>
            `;
            searchResultsDiv.appendChild(resultDiv);
          });
          document.querySelectorAll('.create-profile-btn').forEach(button => {
            button.addEventListener('click', async () => {
              const playerData = await extractPlayerDataWithLLM(button.dataset.text);
              if (playerData) {
                document.getElementById('name-full').value = playerData.name;
                document.getElementById('country').value = playerData.country;
                document.getElementById('year').value = playerData.year;
                document.getElementById('role').value = playerData.role;
                document.getElementById('video-full').value = playerData.video;
                document.getElementById('context').value = playerData.context;
                document.getElementById('tags').value = playerData.tags.join(', ');
                document.getElementById('insight').value = playerData.insight;
                document.getElementById('source').value = 'Google CSE Search';
              }
            });
          });
        }
      });
    });
    observer.observe(document.querySelector('.gcse-search'), { childList: true, subtree: true });
  });

  // Offline support
  window.addEventListener('online', () => document.getElementById('offline-indicator').style.display = 'none');
  window.addEventListener('offline', () => document.getElementById('offline-indicator').style.display = 'block');
  if (!navigator.onLine) document.getElementById('offline-indicator').style.display = 'block';

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/apes-hybrid-scouting-lens/sw.js').catch(err =>
      console.error('Service Worker registration failed:', err)
    );
  }

  displayPlayers();
});