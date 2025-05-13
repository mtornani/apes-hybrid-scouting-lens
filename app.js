const demoPlayers = [
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

function initStorage() {
  const data = JSON.parse(localStorage.getItem('players'));
  if (!data || data.length === 0) {
    showDemoLoaderIfEmpty();
  }
}

function getPlayers() {
  return JSON.parse(localStorage.getItem('players')) || [];
}

function savePlayers(players) {
  localStorage.setItem('players', JSON.stringify(players));
}

function normalizeVideoUrl(url) {
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return url.replace('twitter.com', 'x.com').replace('status', 'embed');
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = url.split('v=')[1] || url.split('/').pop();
    if (videoId.includes('&')) videoId = videoId.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

function renderPlayers(players) {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  players.forEach(player => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <h3>${player.name} (${player.rank})</h3>
      <p><strong>Country:</strong> ${player.country}</p>
      <p><strong>Role:</strong> ${player.role}</p>
      <p><strong>Insight:</strong> ${player.insight}</p>
      <iframe src="${normalizeVideoUrl(player.video)}" allowfullscreen></iframe>
    `;
    playerList.appendChild(card);
  });
}

function populateFilters() {
  const players = getPlayers();
  const countries = [...new Set(players.map(p => p.country))];
  const roles = [...new Set(players.map(p => p.role))];

  document.getElementById('filter-country').innerHTML = '<option value="">All</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join('');
  document.getElementById('filter-role').innerHTML = '<option value="">All</option>' + roles.map(r => `<option value="${r}">${r}</option>`).join('');
}

function applyFilters() {
  const country = document.getElementById('filter-country').value;
  const role = document.getElementById('filter-role').value;
  const rank = document.getElementById('filter-rank').value;

  let players = getPlayers();
  if (country) players = players.filter(p => p.country === country);
  if (role) players = players.filter(p => p.role === role);
  if (rank) players = players.filter(p => p.rank === rank);

  renderPlayers(players);
  showDemoLoaderIfEmpty();
}

document.getElementById('player-form').addEventListener('submit', e => {
  e.preventDefault();
  const player = {
    name: document.getElementById('name').value,
    country: document.getElementById('country').value,
    year: parseInt(document.getElementById('year').value),
    role: document.getElementById('role').value,
    club: document.getElementById('club').value,
    video: document.getElementById('video').value,
    context: document.getElementById('context').value,
    tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
    source: document.getElementById('source').value,
    rank: document.getElementById('rank').value,
    insight: document.getElementById('insight').value
  };

  const players = getPlayers();
  players.push(player);
  savePlayers(players);
  populateFilters();
  applyFilters();
  e.target.reset();
});

document.getElementById('export-btn').addEventListener('click', () => {
  const players = getPlayers();
  const markdown = players.map(p => `
# ${p.name} (${p.rank})
- **Country:** ${p.country}
- **Year of Birth:** ${p.year}
- **Role:** ${p.role}
- **Club:** ${p.club}
- **Video:** ${p.video}
- **Context:** ${p.context}
- **Gesture Tags:** ${p.tags.join(', ')}
- **Source:** ${p.source}
- **Insight:** ${p.insight}
`).join('\n\n');

  const blob = new Blob([markdown], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apes_radar.md';
  a.click();
  URL.revokeObjectURL(url);
});

function showDemoLoaderIfEmpty() {
  const players = getPlayers();
  const demoBtn = document.getElementById('load-demo-btn');
  if (players.length === 0) {
    demoBtn.style.display = 'block';
  } else {
    demoBtn.style.display = 'none';
  }
}

document.getElementById('load-demo-btn').addEventListener('click', () => {
  savePlayers(demoPlayers);
  populateFilters();
  applyFilters();
});

// Init
initStorage();
populateFilters();
applyFilters();

document.getElementById('filter-country').addEventListener('change', applyFilters);
document.getElementById('filter-role').addEventListener('change', applyFilters);
document.getElementById('filter-rank').addEventListener('change', applyFilters);
