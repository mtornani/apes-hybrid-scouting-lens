# APES - Hybrid Scouting Lens

APES is a mobile-first web app designed for football scouts to identify elite U17 players based on social media signals like Twitter/X clips. It focuses on gesture, decision-making, context, and player intuition rather than traditional stats.

## Features
- Add and manage player profiles with detailed scouting insights
- Filter players by name, country, or tags
- Export player data as JSON
- Fully offline, no dependencies
- Responsive design for mobile and desktop

## Installation
1. Clone or download this repository.
2. Place the files (`index.html`, `style.css`, `app.js`) in a folder.
3. Open `index.html` in a browser to use the app offline.

## Running Locally with a Server
To test the app as a website:
1. Open a terminal in the project folder.
2. Run:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

## Deploying to GitHub Pages
1. Initialize a Git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a GitHub repository and push:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```
3. Create a `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```
4. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages.
   - Select the `gh-pages` branch as the source.
   - Save and wait for the site to be published (e.g., `https://<username>.github.io/<repo-name>`).

## Usage
- **Add Player**: Fill out the form with player details (name, country, role, etc.) and click "Add Player".
- **Filter Players**: Use the filter input to search by name, country, or tags.
- **Export Data**: Click "Export to JSON" to download all player data.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.