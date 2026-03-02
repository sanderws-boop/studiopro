# Studio Pro

A professional generative background engine built entirely with vanilla HTML, CSS and WebGL2. No frameworks, no build tools — just open `index.html` and create.

**[Live Demo](https://sanderws-boop.github.io/studiopro/)**

## Features

- **26 generative patterns** — Aurora, Plasma, Nebula, Julia Fractal, Voronoi Cells, Flow Field, and more
- **Multi-layer compositing** — Stack up to 8 layers with 7 blend modes (Normal, Multiply, Screen, Overlay, Add, Soft Light, Difference)
- **30 color palettes** — Each with 5 colors, plus per-layer custom color editing
- **Timeline animation** — Keyframe any parameter with 6 easing curves
- **Audio reactivity** — Connect your microphone and let patterns react to music (bass, mids, highs mapping)
- **Post-processing** — Bloom, chromatic aberration, vignette, film grain, sharpen, lens distortion, color grading
- **Export** — PNG (up to 8K), WebM video, GIF (up to 1920p Full HD), CSS gradients
- **Workflow** — Undo/redo, command palette (Cmd+K), keyboard shortcuts, project save/load

## Getting Started

Open `index.html` in any modern browser. That's it.

Or visit the [live demo](https://sanderws-boop.github.io/studiopro/).

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+K` | Command Palette |
| `Cmd+E` | Export |
| `F` | Fullscreen |
| `1-9` | Select layer |

## Tech Stack

- **WebGL2** — All rendering, shaders, FBOs, multi-pass compositing
- **Vanilla JS** — No frameworks, IIFE namespace pattern
- **Web Audio API** — Microphone input, FFT analysis, beat detection
- **Zero dependencies** — Runs from `file://` or any static host
