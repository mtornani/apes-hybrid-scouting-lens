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
  // Altri giocatori...
];

function loadPlayers() {
  return JSON.parse(localStorage.getItem('players')) || initialPlayers;
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

function displayPlayers(filter = '', ranks = []) {
  const players = loadPlayers();
  const playerList = document.getElementById('player-list');
  const isGrid = playerList.classList.contains('grid');
  playerList.innerHTML = '';

  const filteredPlayers = players.filter(player => 
    (!filter || 
      player.name.toLowerCase().includes(filter.toLowerCase()) ||
      player.country.toLowerCase().includes(filter.toLowerCase()) ||
      player.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    ) && (!ranks.length || ranks.includes(player.rank))
  );

  filteredPlayers.forEach(player => {
    const li = document.createElement('li');
    li.className = 'player-card';
    const thumbnail = getVideoThumbnail(player.video);
    li.innerHTML = `
      ${thumbnail && isGrid ? `<img src="${thumbnail}" alt="${player.name}">` : ''}
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
document.querySelector('.swipe-rank').addEventListener('swipe', e => {
  const ranks = ['Tattico', 'Elettrico', 'Predatore'];
  const currentIndex = ranks.indexOf(selectedRank);
  if (e.detail.dir === 'left' && currentIndex < ranks.length - 1) {
    selectedRank = ranks[currentIndex + 1];
  } else if (e.detail.dir === 'right' && currentIndex > 0) {
    selectedRank = ranks[currentIndex - 1];
  }
  document.querySelectorAll('.rank-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.rank === selectedRank);
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
  displayPlayers();
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
  displayPlayers();
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
document.getElementById('filter').addEventListener('input', e => {
  const ranks = Array.from(document.querySelectorAll('.rank-filters input:checked')).map(cb => cb.dataset.rank);
  displayPlayers(e.target.value, ranks);
});

document.querySelectorAll('.rank-filters input').forEach(cb => {
  cb.addEventListener('change', () => {
    const ranks = Array.from(document.querySelectorAll('.rank-filters input:checked')).map(cb => cb.dataset.rank);
    displayPlayers(document.getElementById('filter').value, ranks);
  });
});

// Toggle View
document.getElementById('toggle-view').addEventListener('click', () => {
  const playerList = document.getElementById('player-list');
  playerList.classList.toggle('grid');
  document.getElementById('toggle-view').textContent = playerList.classList.contains('grid') ? 'Switch to List View' : 'Switch to Grid View';
  displayPlayers(document.getElementById('filter').value, Array.from(document.querySelectorAll('.rank-filters input:checked')).map(cb => cb.dataset.rank));
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
