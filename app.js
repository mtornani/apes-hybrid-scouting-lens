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

// Mappa di insight basati sui tag, con versioni tecnica e narrativa
const insightMap = {
  "explosive dribbling": {
    technical: "Efficace in dribbling nello stretto con accelerazioni rapide.",
    narrative: "Scivola tra gli spazi con la violenza del ritmo, un lampo che disorienta."
  },
  "final pass": {
    technical: "Precisione elevata nei passaggi decisivi in area avversaria.",
    narrative: "Serve assist come un pittore che completa il suo capolavoro con un tocco finale."
  },
  "calm under pressure": {
    technical: "Mantienefocus e decisione in situazioni di alta pressione.",
    narrative: "Un faro nella tempesta, guida la squadra con serenità nei momenti critici."
  },
  "clean tackle": {
    technical: "Interventi difensivi precisi con minimo rischio di fallo.",
    narrative: "Taglia le azioni avversarie con interventi chirurgici, un maestro del timing."
  },
  "anticipation": {
    technical: "Ottima lettura del gioco con posizionamento anticipato.",
    narrative: "Legge il campo come un veggente, sempre un passo avanti agli altri."
  },
  "progressive carry": {
    technical: "Capace di avanzare il pallone con controllo in spazi ristretti.",
    narrative: "Porta il gioco in avanti come un cavaliere in carica, aprendo varchi decisivi."
  },
  "quick turn": {
    technical: "Eccellente agilità nei cambi di direzione sotto pressione.",
    narrative: "Gira su se stesso come una trottola, lasciando i difensori nel vuoto."
  },
  "line-breaking pass": {
    technical: "Passaggi verticali efficaci per superare le linee difensive.",
    narrative: "Lancia frecce nella notte, squarciando le difese con visione pura."
  },
  "feint": {
    technical: "Abile nell’usare finte per superare il diretto avversario.",
    narrative: "Inganna con finte che sembrano magia, un illusionista del pallone."
  },
  "playmaker": {
    technical: "Eccellente visione e distribuzione del gioco in fase offensiva.",
    narrative: "Un regista che muove i pedoni come su una scacchiera, vedendo oltre l’orizzonte."
  },
  "physical presence": {
    technical: "Dominante nei duelli fisici grazie a forza e stazza.",
    narrative: "Un titano che domina il campo con la forza di un uragano."
  },
  "deadly bomber": {
    technical: "Alta capacità realizzativa negli ultimi 16 metri.",
    narrative: "Un cobra in agguato, letale negli ultimi metri con fiuto per il gol."
  },
  "vision": {
    technical: "Ottima percezione del campo e capacità di lettura anticipata.",
    narrative: "Vede ciò che altri non immaginano, un secondo prima che accada."
  },
  "skill_dribbling": {
    technical: "Buona tecnica nel controllo e conduzione del pallone.",
    narrative: "Un giocoliere che danza con il pallone tra i difensori."
  },
  "skill_strength": {
    technical: "Utilizzo efficace della forza fisica in situazioni di contrasto.",
    narrative: "Un colosso che apre varchi con la potenza di un ariete."
  },
  "skill_strenght": {
    technical: "Utilizzo efficace della forza fisica in situazioni di contrasto.",
    narrative: "Un colosso che apre varchi con la potenza di un ariete."
  }
};

// Inizializza il modello LLM (per i tag, non per gli insight al momento)
let tokenizer, model;

async function initializeModel() {
  if (!model) {
    try {
      const { AutoTokenizer, AutoModelForTokenClassification } = window['@xenova/transformers'];
      tokenizer = await AutoTokenizer.from_pretrained('distilbert-base-uncased');
      model = await AutoModelForTokenClassification.from_pretrained('distilbert-base-uncased');
      console.log('Model initialized successfully at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  }
}

function loadPlayers() {
  return JSON.parse(localStorage.getItem('players')) || [];
}

function savePlayer(player) {
  const players = loadPlayers();
  players.push(player);
  localStorage.setItem('players', JSON.stringify(players));
}

function deletePlayer(index) {
  const players = loadPlayers();
  players.splice(index, 1);
  localStorage.setItem('players', JSON.stringify(players));
}

function getVideoThumbnail(video) {
  if (!video) return 'placeholder.png';
  const match = video.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : 'placeholder.png';
}

function isDuplicate(newPlayer, existingPlayers) {
  return existingPlayers.some(player => {
    const nameSimilarity = player.name.toLowerCase().includes(newPlayer.name.toLowerCase());
    const yearMatch = player.year === newPlayer.year;
    return nameSimilarity && yearMatch;
  });
}

function parseReport(reportText) {
  const parts = reportText.split(',').map(part => part.trim());
  if (parts.length < 4) return null;
  const [name, country, year, role] = parts;
  return {
    name: name || 'Unknown',
    country: country || 'Unknown',
    year: parseInt(year) || (new Date().getFullYear() - 17),
    role: role || 'Unknown',
    club: 'Unknown',
    video: '',
    context: '',
    tags: [],
    source: 'Scout (parsed)',
    rank: 'Tattico',
    insight: ''
  };
}

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
      const thumbnail = getVideoThumbnail(player.video);
      li.innerHTML = `
        ${thumbnail ? `<img src="${thumbnail}" alt="${player.name}" style="display: none;">` : ''}
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

    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        deletePlayer(index);
        displayPlayers(
          document.getElementById('filter-country').value,
          document.getElementById('filter-role').value,
          document.getElementById('filter-rank').value
        );
      });
    });
  }
}

const tags = [];
document.querySelectorAll('.tag').forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
    const tag = button.dataset.tag;
    if (tags.includes(tag)) {
      tags.splice(tags.indexOf(tag), 1);
    } else {
      tags.push(tag);
    }
  });
});

let selectedRank = 'Tattico';
$(document).ready(function() {
  $(".swipe-rank").swipe({
    swipe: function(event, direction) {
      const ranks = ['Tattico', 'Elettrico', 'Predatore'];
      const currentIndex = ranks.indexOf(selectedRank);
      if (direction === 'left' && currentIndex < ranks.length - 1) {
        selectedRank = ranks[currentIndex + 1];
      } else if (direction === 'right' && currentIndex > 0) {
        selectedRank = ranks[currentIndex - 1];
      }
      document.querySelectorAll('.rank-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.rank === selectedRank);
      });
    }
  });

  document.querySelectorAll('.rank-option').forEach(option => {
    option.addEventListener('click', () => {
      selectedRank = option.dataset.rank;
      document.querySelectorAll('.rank-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.rank === selectedRank);
      });
    });
  });
});

document.getElementById('quick-save').addEventListener('click', () => {
  const player = {
    name: document.getElementById('name').value || 'Unknown',
    video: document.getElementById('video').value,
    tags,
    rank: selectedRank,
    country: 'Unknown',
    year: new Date().getFullYear() - 17,
    role: 'Unknown',
    club: 'Unknown',
    context: '',
    source: 'Scout',
    insight: tags.map(tag => insightMap[tag] || `Abile in ${tag.replace('skill_', '')}.`).join(' ')
  };
  const players = loadPlayers();
  if (isDuplicate(player, players)) {
    alert('Possibile duplicato rilevato! Questo giocatore potrebbe già esistere.');
  } else {
    savePlayer(player);
  }
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
  document.getElementById('name').value = '';
  document.getElementById('video').value = '';
  tags.length = 0;
  document.querySelectorAll('.tag').forEach(btn => btn.classList.remove('selected'));
});

async function suggestTags(contextText) {
  await initializeModel();
  if (!contextText || !model || !tokenizer) {
    console.warn('Model or tokenizer not available, falling back to fuzzy matching');
    return fuzzySuggestTags(contextText);
  }

  try {
    const inputs = tokenizer(contextText, { max_length: 128, truncation: true, return_tensors: 'array' });
    const outputs = await model(inputs);
    const logits = outputs.logits;
    const predictions = Array.from(logits[0]).map((score, idx) => ({ token: tokenizer.decode([idx]), score }));

    const relevantTokens = predictions
      .filter(p => p.score > 0.5)
      .map(p => p.token.toLowerCase())
      .filter(token => token.length > 3 && !['the', 'and', 'in'].includes(token));

    console.log('Relevant tokens from LLM:', relevantTokens);

    const suggestedTags = new Set();
    relevantTokens.forEach(token => {
      const matchingTag = Object.keys(insightMap).find(tag => tag.includes(token) || levenshteinDistance(tag, token) < 2);
      if (matchingTag) {
        suggestedTags.add(matchingTag);
      } else if (token in insightMap) {
        suggestedTags.add(token);
      } else {
        suggestedTags.add(`skill_${token}`);
      }
    });

    const tags = Array.from(suggestedTags).slice(0, 5);
    console.log('Suggested tags from LLM:', tags);
    return tags.length > 0 ? tags : fuzzySuggestTags(contextText);
  } catch (error) {
    console.error('Error in LLM suggestTags:', error);
    return fuzzySuggestTags(contextText);
  }
}

function fuzzySuggestTags(contextText) {
  if (!contextText) return [];
  const words = contextText.toLowerCase().split(/\W+/);
  const suggestedTags = new Set();

  words.forEach(word => {
    const matchingTag = Object.keys(insightMap).find(tag => 
      levenshteinDistance(tag, word) < 2 || tag.includes(word)
    );
    if (matchingTag) {
      suggestedTags.add(matchingTag);
    } else if (word.length > 3) {
      suggestedTags.add(`skill_${word}`);
    }
  });

  return Array.from(suggestedTags).slice(0, 5);
}

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

function generateInsight(tags, style = 'narrative') {
  if (!tags || tags.length === 0) return "Nessun insight disponibile.";
  const insights = tags.map(tag => {
    const entry = insightMap[tag] || { technical: `Abile in ${tag.replace('skill_', '')}.`, narrative: `Abile in ${tag.replace('skill_', '')}, un talento da affinare.` };
    return style === 'technical' ? entry.technical : entry.narrative;
  }).filter(Boolean);
  return insights.length > 0 ? insights.join(' ') : "Insight basato sui tag.";
}

document.getElementById('context').addEventListener('input', async () => {
  const contextText = document.getElementById('context').value;
  if (contextText) {
    const suggestedTags = await suggestTags(contextText);
    const suggestedTagsDiv = document.getElementById('suggested-tags');
    suggestedTagsDiv.innerHTML = suggestedTags.length > 0 
      ? suggestedTags.map(tag => `<button class="suggested-tag" data-tag="${tag}">${tag}</button>`).join(' ')
      : 'Nessun tag suggerito.';
    
    document.querySelectorAll('.suggested-tag').forEach(button => {
      button.addEventListener('click', () => {
        const tag = button.dataset.tag;
        const tagsInput = document.getElementById('tags');
        const currentTags = tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()) : [];
        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
          tagsInput.value = currentTags.join(', ');
        }
      });
    });
  } else {
    document.getElementById('suggested-tags').innerHTML = '';
  }
});

document.getElementById('generate-insight').addEventListener('click', () => {
  console.log('Generate Insight clicked');
  const tagsInput = document.getElementById('tags').value;
  console.log('Tags input:', tagsInput);
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
  console.log('Parsed tags:', tags);
  const insightStyle = document.querySelector('input[name="insight-style"]:checked')?.value || 'narrative';
  const insight = generateInsight(tags, insightStyle);
  console.log('Generated insight:', insight);
  document.getElementById('insight').value = insight;
});

document.getElementById('scout-form').addEventListener('submit', e => {
  e.preventDefault();
  let player;
  const reportText = document.getElementById('report-input') ? document.getElementById('report-input').value : '';
  if (reportText) {
    player = parseReport(reportText);
    if (!player) {
      alert('Formato report non valido! Usa: Nome, Paese, Anno, Ruolo');
      return;
    }
    player.video = document.getElementById('video-full').value;
    player.tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    player.source = document.getElementById('source').value || 'Scout (parsed)';
    player.rank = document.getElementById('rank-full').value;
    player.insight = document.getElementById('insight').value;
  } else {
    player = {
      name: document.getElementById('name-full').value,
      country: document.getElementById('country').value,
      year: parseInt(document.getElementById('year').value),
      role: document.getElementById('role').value,
      club: document.getElementById('club').value,
      video: document.getElementById('video-full').value,
      context: document.getElementById('context').value,
      tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()),
      source: document.getElementById('source').value,
      rank: document.getElementById('rank-full').value,
      insight: document.getElementById('insight').value
    };
  }
  const players = loadPlayers();
  if (isDuplicate(player, players)) {
    alert('Possibile duplicato rilevato! Questo giocatore potrebbe già esistere.');
  } else {
    savePlayer(player);
  }
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
  e.target.reset();
});

document.getElementById('toggle-form').addEventListener('click', () => {
  const quickEntry = document.querySelector('.quick-entry');
  const fullForm = document.getElementById('scout-form');
  quickEntry.style.display = quickEntry.style.display === 'none' ? 'flex' : 'none';
  fullForm.style.display = fullForm.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('filter-country').addEventListener('change', () => {
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
});

document.getElementById('filter-role').addEventListener('change', () => {
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
});

document.getElementById('filter-rank').addEventListener('change', () => {
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
});

document.getElementById('load-demo').addEventListener('click', () => {
  localStorage.setItem('players', JSON.stringify(initialPlayers));
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
  alert('Radar demo caricato con successo!');
});

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

window.addEventListener('online', () => {
  document.getElementById('offline-indicator').style.display = 'none';
});

window.addEventListener('offline', () => {
  document.getElementById('offline-indicator').style.display = 'block';
});

if (!navigator.onLine) {
  document.getElementById('offline-indicator').style.display = 'block';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/apes-hybrid-scouting-lens/sw.js').catch(err => {
      console.error('Registrazione Service Worker fallita:', err);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializeModel();
  displayPlayers();
});
