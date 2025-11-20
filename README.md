[![Lint & Build Status](https://github.com/GeckoCoRopes/anchorGame/actions/workflows/ci.yml/badge.svg)](https://github.com/GeckoCoRopes/anchorGame/actions/workflows/ci.yml)
[![Dependabot Status](https://img.shields.io/badge/dependabot-enabled-brightgreen?logo=dependabot)](https://github.com/daneevans/anchorGame/pulls?q=is%3Apr+author%3Aapp%2Fdependabot)

[Live Site](https://geckocoropes.github.io/anchorGame/)

[![Support us on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/geckoco)

# Anchor Game

Anchor Game is a web-based interactive simulation where you are presented with a randomly generated climbing anchor system. Each anchor is made up of several components, and your goal is to decide whether to trust the anchor (Fly), play it safe (Die), or investigate its parts for more information.

## How to Play

- On each round, a new anchor system is generated from random components.
- The components are listed on the screen.
- You can:
  - **Fly**: Attempt to use the anchor. If there is a hidden failure, you die. If not, you live!
  - **Die**: Play it safe. If there was a hidden failure, you are congratulated for avoiding disaster. If not, you are told it was safe.
  - **Next**: After making your choice, press Next to see a new anchor.
- **Investigate Components**: Type commands in the input box to get more information about any component. Use any of these keywords:
  - `investigate`, `check`, `inspect`, `examine`, or `look at`
  - Example: `inspect sling` or `check anchor corrosion`
  - **General inspect** (e.g., `inspect sling`):
    - In **easy/medium** mode, you always get the correct answer.
    - In **hard** mode, there is a 70% chance you will be told "Looks OK" even if there is a hidden failure.
  - **Key-based inspect** (e.g., `inspect anchor corrosion`):
    - If you specify both a component and a failure key (from the JSON, e.g., `corrosion`, `gate`, `wear`), you will always get the correct answer for that component and key, even in hard mode.
    - Example: `check sling abrasion` or `inspect anchor corrosion`.

## Customization

- All anchor components are defined in JSON files in the `components/` directory.
- You can add, remove, or edit components and their possible failure modes by editing these files.
- All connectors (top, middle, bottom) use the shared `connector.json` config.

### Component Wiki

- Visit [`wiki.html`](https://geckocoropes.github.io/anchorGame/wiki.html) for a browsable reference of every component plus their failure modes.
- The wiki reads directly from the same JSON files—updating `components/*.json` instantly updates the wiki on the next deploy.
- Drop photos into `images/components/<type>/` using the slugified component name (e.g., `images/components/sling/dyneema-sling.jpg`). Supported formats: `.webp`, `.png`, `.jpg`, `.jpeg`, `.svg`.
- If no matching photo exists the wiki shows a placeholder reminding you where to add one.

## Running Locally

You must use a local web server to run the game locally (due to browser security restrictions on file loading).

### Using Node.js
1. Install `http-server` if you haven't:
   ```sh
   npm install -g http-server
   ```
2. In your project directory, run:
   ```sh
   http-server -p 8000
   ```
3. Open your browser to [http://localhost:8000](http://localhost:8000)

### Using Python
```sh
python3 -m http.server 8000
```

## Linting

To check your code for issues:

- Lint JavaScript: `npm run lint:js`
- Lint HTML: `npm run lint:html`

These commands use ESLint and HTMLHint to help keep your code clean and error-free.

## Play Online

Play the latest version here: [https://geckocoropes.github.io/anchorGame/](https://geckocoropes.github.io/anchorGame/)

## Support

If you enjoy the game, consider supporting us on Ko-fi: [https://ko-fi.com/geckoco](https://ko-fi.com/geckoco)

## Bugs & Feedback

Please report bugs or suggest improvements here: [GitHub Issues](https://github.com/GeckoCoRopes/anchorGame/issues)