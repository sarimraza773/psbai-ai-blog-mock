# PSB AI – Dummy Site (Home + Blog)

This is a lightweight static mock site that matches the **Penn State Behrend AI** look & feel
(dark navy header, bold hero, section cards, CTA buttons).

## Pages
- `/index.html` – Home (interactive dropdown + smooth scrolling)
- `/blog/index.html` – Blog (interactive search + tag filter)
- `/404.html` – Error page
- All other top-nav links intentionally point to `/404.html`

## Run locally
### Option A (quick): VS Code Live Server
Open the folder and run **Live Server**.

### Option B: Python simple server
```bash
cd .
python -m http.server 5500
```
Then open:
- http://localhost:5500/index.html
- http://localhost:5500/blog/

## Customize
- Update brand colors in `assets/css/style.css` (`--nittany-navy`, `--beaver-blue`, `--pugh-blue`)
- Replace hero/background images by swapping CSS gradients with real images if desired.
