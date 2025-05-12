const initialPlayers = [
  {
    name: "Gabriel Sanabria",
    country: "Ecuador",
    year: 2008,
    role: "Central Midfielder",
    club: "Independiente del Valle U17",
    video: "https://twitter.com/scoutecuador/status/1234567890",
    context: "2 assists vs LDU Quito U17 – Copa Mitad del Mundo",
    tags: ["line-breaking pass", "quick turn", "under pressure"],
    source: "scout verified",
    rank: "Tattico",
    insight: "Calm under pressure and vertical in thought. Sanabria shows signs of a mature playmaker, already threading passes between compact lines in high-intensity matches."
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
    insight: "Raw, instinctive and devastating in short space. Dlamini plays with the violence of rhythm, uncoachable in the way he deceives markers. Not refined, but unique."
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
    insight: "Muniz anticipates, disarms, and then builds. His first thought is not to defend but to dominate the tempo from behind. A defender with quarterback instincts."
  }
];

function loadPlayers() {
  const players = JSON.parse(localStorage.getItem('players')) || initialPlayers;
  localStorage.setItem('players', JSON.stringify(players));
  return players;
}

function savePlayer(player) {
  const players = loadPlayers();
  players.push(player);
  localStorage.setItem('players', JSON.stringify(players));
}

function displayPlayers(filter = '') {
  const players = loadPlayers();
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(filter.toLowerCase()) ||
    player.country.toLowerCase().includes(filter.toLowerCase()) ||
    player.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
  );
  
  filteredPlayers.forEach(player => {
    const li = document.createElement('li');
    li.className = 'player-card';
    li.innerHTML = `
      <h3>${player.name} (${player.country}, ${player.year})</h3>
      <p><strong>Role:</strong> ${player.role}</p>
      <p><strong>Club:</strong> ${player.club}</p>
      ${player.video ? `<p><strong>Video:</strong> <a href="${player.video}" target="_blank">Watch</a></p>` : ''}
      ${player.context ? `<p><strong>Context:</strong> ${player.context}</p>` :'= ''}
      <p><strong>Tags:</strong> ${player.tags.join(', ')}</p>
      <p><strong>Source:</strong> ${player.source}</p>
      <p><strong>Rank:</strong> ${player.rank}</p>
      <p><strong>Insight:</strong> ${player.insight}</p>
    `;
    playerList.appendChild(li);
  });
}

document.getElementById('scout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const player = {
    name: document.getElementById('name').value,
    country: document.getElementById('country').value,
    year: parseInt(document.getElementById('year').value),
    role: document.getElementById('role').value,
    club: document.getElementById('club').value,
    video: document.getElementById('video').value,
    context: document.getElementById('context').value,
    tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()),
    source: document.getElementById('source').value,
    rank: document.getElementById('rank').value,
    insight: document.getElementById('insight').value
  };
  savePlayer(player);
  displayPlayers();
  e.target.reset();
});

document.getElementById('filter').addEventListener('input', (e) => {
  displayPlayers(e.target.value);
});

document.getElementById('export-btn').addEventListener('click', () => {
  const players = loadPlayers();
  const json = JSON.stringify(players, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apes_players.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.addEventListener('DOMContentLoaded', () => {
  displayPlayers();
});