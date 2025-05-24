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
      insight: "Un metronomo che orchestra il gioco con passaggi che tagliano le linee come lame."
    },
    {
      name: "Sipho Dlamini",
      country: "South Africa",
      year: 2009,
      role: "Winger (Left)",
      club: "SuperSport United U17",
      video: "https://twitter.com/africatalents/status/9876543210",
      context: "1v1 dribble + assist in AFCON U17",
      tags: ["explosive dribbling", "feint", "final pass"],
      source: "local journalist",
      rank: "Elettrico",
      insight: "Un fulmine che danza sulla fascia, lasciando i difensori a inseguire ombre."
    },
    {
      name: "Thiago Muniz",
      country: "Brazil",
      year: 2008,
      role: "Centre-Back",
      club: "Atlético Paranaense U17",
      video: "https://twitter.com/futebolbase/status/1029384756",
      context: "Clean tackle + vertical carry in Copa RS",
      tags: ["anticipation", "clean tackle", "progressive carry"],
      source: "academy coach",
      rank: "Predatore",
      insight: "Un muro che legge il gioco in anticipo, costruendo dal basso con la precisione di un architetto."
    }
  ];

  // Mappa degli insight
  const insightMap = {
    "explosive dribbling": { technical: "Efficace in dribbling nello stretto con accelerazioni rapide.", narrative: "Scivola tra gli spazi con la violenza del ritmo, un lampo che disorienta." },
    "final pass": { technical: "Precisione elevata nei passaggi decisivi in area avversaria.", narrative: "Serve assist come un pittore che completa il suo capolavoro con un tocco finale." },
    "calm under pressure": { technical: "Mantienefocus e decisione in situazioni di alta pressione.", narrative: "Un faro nella tempesta, guida la squadra con serenità nei momenti critici." },
    "clean tackle": { technical: "Interventi difensivi precisi con minimo rischio di fallo.", narrative: "Taglia le azioni avversarie con interventi chirurgici, un maestro del timing." },
    "anticipation": { technical: "Ottima lettura del gioco con posizionamento anticipato.", narrative: "Legge il campo come un veggente, sempre un passo avanti agli altri." },
    "progressive carry": { technical: "Capace di avanzare il pallone con controllo in spazi ristretti.", narrative: "Porta il gioco in avanti come un cavaliere in carica, aprendo varchi decisivi." },
    "quick turn": { technical: "Eccellente agilità nei cambi di direzione sotto pressione.", narrative: "Gira su se stesso come una trottola, lasciando i difensori nel vuoto." },
    "line-breaking pass": { technical: "Passaggi verticali efficaci per superare le linee difensive.", narrative: "Lancia frecce nella notte, squarciando le difese con visione pura." },
    "feint": { technical: "Abile nell’usare finte per superare il diretto avversario.", narrative: "Inganna con finte che sembrano magia, un illusionista del pallone." }
    // Aggiungi altri tag se necessario
  };

  // Inizializza il modello LLM
  async function initializeModel() {
    if (!window['@xenova/transformers']) return;
    if (!model) {
      try {
        const { AutoTokenizer, AutoModelForTokenClassification } = window['@xenova/transformers'];
        tokenizer = await AutoTokenizer.from_pretrained('distilbert-base-uncased');
        model = await AutoModelForTokenClassification.from_pretrained('distilbert-base-uncased');
        console.log('Model initialized at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error initializing model:', error);
      }
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

  // Parsing report
  function parseReport(reportText) {
    const [name, country, year, role] = reportText.split(',').map(part => part.trim());
    return name && country && year && role ? {
      name, country, year: parseInt(year), role,
      club: 'Unknown', video: '', context: '', tags: [], source: 'Scout (parsed)', rank: 'Tattico', insight: ''
    } : null;
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
      playerList.innerHTML = '<li>No players found.</li>';
    } else {
      filteredPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-card';
        li.innerHTML = `
          <h3>${player.name} (${player.country}, ${player.year})</h3>
          <p><strong>Role:</strong> ${player.role}</p>
          <p><strong>Club:</strong> ${player.club}</p>
          ${player.video ? `<p><strong>Video:</strong> <a href="${player.video}" target="_blank">Watch</a></p>` : ''}
          ${player.context ? `<p><strong>Context:</strong> ${player.context}</p>` : ''}
          <p><strong>Tags:</strong> ${player.tags.join(', ')}</p>
          <p><strong>Source:</strong> ${player.source}</p>
          <p><strong>Rank:</strong> ${player.rank}</p>
          <p><strong>Insight:</strong> ${player.insight}</p>
          <button class="delete-btn" data-index="${index}">Delete</button>
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

  // Gestione tag e rank
  let tags = [];
  document.querySelectorAll('.tag').forEach(button =>
    button.addEventListener('click', () => {
      button.classList.toggle('selected');
      const tag = button.dataset.tag;
      if (tags.includes(tag)) tags = tags.filter(t => t !== tag);
      else tags.push(tag);
    })
  );

  let selectedRank = 'Tattico';
  document.querySelectorAll('.rank-option').forEach(option =>
    option.addEventListener('click', () => {
      selectedRank = option.dataset.rank;
      document.querySelectorAll('.rank-option').forEach(opt =>
        opt.classList.toggle('selected', opt.dataset.rank === selectedRank)
      );
    })
  );

  // Quick save
  document.getElementById('quick-save').addEventListener('click', () => {
    const player = {
      name: document.getElementById('name').value || 'Unknown',
      video: document.getElementById('video').value,
      tags,
      rank: selectedRank,
      country: 'Unknown', year: new Date().getFullYear() - 17,
      role: 'Unknown', club: 'Unknown', context: '', source: 'Scout',
      insight: tags.map(tag => insightMap[tag]?.narrative || `Abile in ${tag.replace('skill_', '')}.`).join(' ')
    };
    savePlayer(player);
    displayPlayers();
    document.getElementById('name').value = '';
    document.getElementById('video').value = '';
    tags = [];
    document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('selected'));
  });

  // Suggerimento tag
  async function suggestTags(contextText) {
    if (!contextText || !model || !tokenizer) return fuzzySuggestTags(contextText);
    try {
      const inputs = tokenizer(contextText, { max_length: 128, truncation: true, return_tensors: 'array' });
      const outputs = await model(inputs);
      const logits = outputs.logits;
      const predictions = Array.from(logits[0]).map((score, idx) => ({ token: tokenizer.decode([idx]), score }));
      return predictions
        .filter(p => p.score > 0.5)
        .map(p => p.token.toLowerCase())
        .filter(token => token.length > 3)
        .map(token => insightMap[token] ? token : `skill_${token}`)
        .slice(0, 5) || fuzzySuggestTags(contextText);
    } catch (error) {
      console.error('Error in suggestTags:', error);
      return fuzzySuggestTags(contextText);
    }
  }

  function fuzzySuggestTags(contextText) {
    if (!contextText) return [];
    return contextText.toLowerCase().split(/\W+/)
      .filter(word => word.length > 3)
      .map(word => insightMap[word] ? word : `skill_${word}`)
      .slice(0, 5);
  }

  // Generazione insight
  function generateInsight(tags, style = 'narrative') {
    if (!tags?.length) return "Nessun insight disponibile.";
    return tags.map(tag => insightMap[tag]?.[style] || `Abile in ${tag.replace('skill_', '')}.`).join(' ');
  }

  // Event listener per contesto e tag suggeriti
  document.getElementById('context').addEventListener('input', async () => {
    const contextText = document.getElementById('context').value;
    const suggestedTagsDiv = document.getElementById('suggested-tags');
    if (contextText) {
      const suggestedTags = await suggestTags(contextText);
      suggestedTagsDiv.innerHTML = suggestedTags.map(tag => 
        `<button class="suggested-tag" data-tag="${tag}">${tag}</button>`
      ).join(' ') || 'Nessun tag suggerito.';
      document.querySelectorAll('.suggested-tag').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tag = button.dataset.tag;
          const tagsInput = document.getElementById('tags');
          const currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
          if (!currentTags.includes(tag)) {
            tagsInput.value = [...currentTags, tag].join(', ');
          }
        });
      });
    } else {
      suggestedTagsDiv.innerHTML = '';
    }
  });

  // Generazione insight
  document.getElementById('generate-insight').addEventListener('click', () => {
    const tagsInput = document.getElementById('tags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(t => t);
    const insightStyle = document.querySelector('input[name="insight-style"]:checked')?.value || 'narrative';
    document.getElementById('insight').value = generateInsight(tags, insightStyle);
  });

  // Submit form
  document.getElementById('scout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const reportText = document.getElementById('report-input')?.value;
    let player = reportText ? parseReport(reportText) : {
      name: document.getElementById('name-full').value,
      country: document.getElementById('country').value,
      year: parseInt(document.getElementById('year').value),
      role: document.getElementById('role').value,
      club: document.getElementById('club').value,
      video: document.getElementById('video-full').value,
      context: document.getElementById('context').value,
      tags: document.getElementById('tags').value.split(',').map(t => t.trim()),
      source: document.getElementById('source').value,
      rank: document.getElementById('rank-full').value,
      insight: document.getElementById('insight').value
    };
    if (player) {
      player.tags = player.tags || [];
      player.insight = player.insight || generateInsight(player.tags);
      savePlayer(player);
      displayPlayers();
      e.target.reset();
    } else {
      alert('Formato report non valido! Usa: Nome, Paese, Anno, Ruolo');
    }
  });

  // Toggle form
  document.getElementById('toggle-form').addEventListener('click', () => {
    const quickEntry = document.querySelector('.quick-entry');
    const fullForm = document.getElementById('scout-form');
    quickEntry.style.display = quickEntry.style.display === 'none' ? 'flex' : 'none';
    fullForm.style.display = fullForm.style.display === 'none' ? 'flex' : 'none';
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
    alert('Radar demo caricato con successo!');
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    const players = loadPlayers();
    const markdown = players.map(p => `
### ${p.name} (${p.country}, ${p.year})
- **Ruolo**: ${p.role}
- **Club**: ${p.club}
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
    a.download = 'apes_players.md';
    a.click();
    URL.revokeObjectURL(url);
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

  // Inizializza la visualizzazione
  displayPlayers();
});
