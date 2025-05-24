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
    insight: "Calm under pressure and vertical in thought."
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
    insight: "Raw, instinctive, and devastating in short space."
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
    insight: "Anticipates, disarms, and builds with quarterback instincts."
  }
];

// Mappa di tag predefiniti per il suggerimento, espansa con sinonimi e combinazioni
const tagMap = {
  "dribbling": ["explosive dribbling", "feint"],
  "dribble": ["explosive dribbling", "feint"],
  "assist": ["final pass", "line-breaking pass"],
  "pass": ["line-breaking pass", "final pass"],
  "calm": ["calm under pressure"],
  "pressure": ["calm under pressure"],
  "tackle": ["clean tackle", "anticipation"],
  "defend": ["clean tackle", "anticipation"],
  "carry": ["progressive carry"],
  "run": ["progressive carry"],
  "turn": ["quick turn"],
  "spin": ["quick turn"],
  "fast": ["explosive dribbling", "quick turn"],
  "quick": ["quick turn", "explosive dribbling"],
  "vertical": ["line-breaking pass", "progressive carry"],
  "creative": ["final pass", "line-breaking pass"]
};

// Mappa di insight basati sui tag
const insightMap = {
  "explosive dribbling": "Abile nel superare gli avversari con dribbling rapidi.",
  "final pass": "Efficace nel fornire passaggi decisivi.",
  "calm under pressure": "Mantiene la calma sotto pressione.",
  "clean tackle": "Preciso e pulito nei contrasti.",
  "anticipation": "Grande capacità di lettura del gioco.",
  "progressive carry": "Porta il pallone in avanti con sicurezza.",
  "quick turn": "Rapido nei cambi di direzione.",
  "line-breaking pass": "Capace di spezzare le linee con passaggi incisivi.",
  "feint": "Efficace nell’ingannare gli avversari con finte."
};

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
    insight: tags.map(tag => insightMap[tag] || `Skilled in ${tag}.`).join(' ')
  };
  const players = loadPlayers();
  if (isDuplicate(player, players)) {
    alert('Possible duplicate detected! This player may already exist.');
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
  if (!contextText) return [];
  const words = contextText.toLowerCase().split(/\W+/);
  let suggestedTags = new Set();

  // Cerca corrispondenze dirette
  words.forEach(word => {
    if (tagMap[word]) {
      tagMap[word].forEach(tag => suggestedTags.add(tag));
    }
  });

  // Cerca combinazioni di parole (es. "dribbling rapido")
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    const phraseWords = phrase.split(' ');
    phraseWords.forEach(word => {
      if (tagMap[word]) {
        tagMap[word].forEach(tag => suggestedTags.add(tag));
      }
    });
  }

  // Fallback: se non ci sono corrispondenze, suggerisci un tag generico
  if (suggestedTags.size === 0) {
    words.forEach(word => {
      if (word.length > 3) { // Ignora parole troppo corte
        suggestedTags.add(word);
      }
    });
  }

  return Array.from(suggestedTags);
}

function generateInsight(tags) {
  if (!tags || tags.length === 0) return "No insight available.";
  const insights = tags.map(tag => insightMap[tag] || `Skilled in ${tag}.`).filter(Boolean);
  return insights.length > 0 ? insights.join(' ') : "Insight based on tags.";
}

document.getElementById('context').addEventListener('input', async () => {
  const contextText = document.getElementById('context').value;
  if (contextText) {
    const suggestedTags = await suggestTags(contextText);
    const suggestedTagsDiv = document.getElementById('suggested-tags');
    suggestedTagsDiv.innerHTML = suggestedTags.length > 0 
      ? suggestedTags.map(tag => `<button class="suggested-tag" data-tag="${tag}">${tag}</button>`).join(' ')
      : 'No tags suggested.';
    
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
  const insight = generateInsight(tags);
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
      alert('Invalid report format! Use: Name, Country, Year, Role');
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
    alert('Possible duplicate detected! This player may already exist.');
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
  alert('Demo radar loaded successfully!');
});

document.getElementById('export-btn').addEventListener('click', () => {
  const players = loadPlayers();
  const markdown = players.map(p => `
### ${p.name} (${p.country}, ${p.year})
- **Role**: ${p.role}
- **Club**: ${p.club}
${p.video ? `- **Video**: [Watch](${p.video})` : ''}
${p.context ? `- **Context**: ${p.context}` : ''}
- **Tags**: ${p.tags.join(', ')}
- **Source**: ${p.source}
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
      console.error('Service Worker registration failed:', err);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  displayPlayers();
});
