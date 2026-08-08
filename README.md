# Three Kingdoms Social Network

An interactive social-network visualization for *Romance of the Three Kingdoms*. The site maps character appearances and relationships across major historical/story periods so readers can explore how alliances, rivalries, and influence shift over time.

## Preview

Latest published site:

<https://hengjiwang.github.io/threekingdoms.github.io/>

If the latest commit has not been deployed yet, GitHub Pages may take a few minutes to update after the branch is pushed.

## What you can do

- Switch between story periods, including **Three Kingdoms** and **Reunification**.
- Click a character node to focus on that character's immediate relationship network.
- Drag nodes to rearrange the force-directed graph.
- Search for a character by name to highlight matching nodes.
- Use the color legend to read each character's faction at a glance.

## Project structure

```text
.
├── data/              # Precomputed node and edge JSON files for each period
├── images/            # Site artwork, favicon, and character portraits
├── scripts/           # D3 visualization and legend scripts
├── styles/            # Site stylesheet
├── index.html         # Static site entry point
└── sitemap.xml        # Published URL metadata
```

## Data and credits

- Visualization and site: Hengji Wang & Yue Liu
- Text source: *Romance of the Three Kingdoms*, translated by C. H. Brewitt-Taylor
- Character portraits: Kongming.net portrait archive
- Visualization library: [D3.js](https://d3js.org/)

## Local development

This is a static site and does not require a build step.

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/> in your browser.

## Deployment

The project is intended to be published with GitHub Pages. Push changes to the publishing branch and wait for Pages to finish deployment, then visit the preview URL above.
