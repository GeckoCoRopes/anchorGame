[Live Site](https://geckocoropes.github.io/anchorGame/)

[Support us on Ko-fi](https://ko-fi.com/geckoco)

# Text Adventure Game

This is a simple text-based adventure game playable in your browser. Enter commands to explore, collect items, and win!

## How to Play
- Type commands like `look`, `go north`, `take key`, `open chest`, etc.
- The game responds to your actions and updates the story.
- Try to find the treasure!

## Hosting on GitHub Pages
1. Commit and push the files (`index.html`, `game.js`, and this `README.md`) to your repository.
2. Go to your repository settings on GitHub.
3. Under **Pages**, set the source to the `main` branch (or your default branch).
4. Visit the provided URL to play the game online.

## Running Locally with Node.js
If you want to run the project locally, you need to use a local web server. One easy way is with Node.js:

1. Install the `http-server` package globally (if you haven't already):
   ```sh
   npm install -g http-server
   ```
2. In your project directory, run:
   ```sh
   http-server -p 8000
   ```
3. Open your browser and go to:
   [http://localhost:8000](http://localhost:8000)

This will serve your files locally so you can test the game in your browser.