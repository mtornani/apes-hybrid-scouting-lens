```javascript
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

function loadPlayers() {
  return JSON.parse(localStorage.getItem('players')) || [];
}

function savePlayer(player) {
  const players = loadPlayers();
  players.push(player);
  localStorage.setItem('players', JSON.stringify(players));
}

function getVideoThumbnail(video) {
  if (!video) return 'placeholder.png';
  const match = video.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : 'placeholder.png';
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

  filteredPlayers.forEach(player => {
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
    `;
    playerList.appendChild(li);
  });
}

// Quick Add Logic
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
    insight: tags.join(', ')
  };
  savePlayer(player);
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

// Full Form Logic
document.getElementById('scout-form').addEventListener('submit', e => {
  e.preventDefault();
  const player = {
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
  savePlayer(player);
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
  e.target.reset();
});

// Toggle Form
document.getElementById('toggle-form').addEventListener('click', () => {
  const quickEntry = document.querySelector('.quick-entry');
  const fullForm = document.getElementById('scout-form');
  quickEntry.style.display = quickEntry.style.display === 'none' ? 'flex' : 'none';
  fullForm.style.display = fullForm.style.display === 'none' ? 'flex' : 'none';
});

// Filter Logic
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

// Load Demo Radar
document.getElementById('load-demo').addEventListener('click', () => {
  localStorage.setItem('players', JSON.stringify(initialPlayers));
  displayPlayers(
    document.getElementById('filter-country').value,
    document.getElementById('filter-role').value,
    document.getElementById('filter-rank').value
  );
});

// Export to Markdown
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

// Offline Detection
window.addEventListener('online', () => {
  document.getElementById('offline-indicator').style.display = 'none';
});

window.addEventListener('offline', () => {
  document.getElementById('offline-indicator').style.display = 'block';
});

if (!navigator.onLine) {
  document.getElementById('offline-indicator').style.display = 'block';
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/apes-hybrid-scouting-lens/sw.js');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  displayPlayers();
});
```
