# Backdrop

A professional generative background engine built entirely with vanilla HTML, CSS and WebGL2. No frameworks, no build tools — just open `index.html` and create.

**[Live Demo](https://sanderws-boop.github.io/backdrop/)**

## Features

- **8 generative patterns** — Aurora, Plasma, Soft Orbs, Silk Waves, Spectral Haze, Petal Drift, Gradient Mesh, Color Split
- **Color palettes** — Obsidian preset, custom 5-color editing, and Auto Palette (pick one color + dark/light theme)
- **Split Layout** — Combine a solid color area with the pattern for presentation-ready backgrounds (left/right/top/bottom, 25/50/75%)
- **Parameters** — Seed, scale, warp, angle per pattern
- **Timeline animation** — Keyframe any parameter with 6 easing curves
- **Post-processing** — Film grain, ACES tonemapping
- **Export** — PNG (up to 8K), seamless looping GIF (up to 1920p Full HD)
- **Workflow** — Undo/redo, command palette (Cmd+K), keyboard shortcuts, project save/load

## Getting Started

Open `index.html` in any modern browser. That's it.

Or visit the [live demo](https://sanderws-boop.github.io/backdrop/).

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+K` | Command Palette |
| `Cmd+E` | Export |
| `F` | Fullscreen |
| `R` | Randomize seed |
| `1/2/3` | Speed 0.5x/1x/2x |

## Tech Stack

- **WebGL2** — All rendering, shaders, FBOs
- **Vanilla JS** — No frameworks, IIFE namespace pattern
- **Zero dependencies** — Runs from `file://` or any static host

## License

MIT — see [LICENSE](LICENSE) for details.

## Contributors

- [sanderws-boop](https://github.com/sanderws-boop)
- [@poaster_](https://x.com/poaster_)
- [Claude Code](https://claude.ai/claude-code) by Anthropic
