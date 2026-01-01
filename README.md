# angela2027.org static website

This folder contains a simple static website for:

- Main page: https://angela2027.org
- Project 1: https://angela2027.org/project1
- Project 2: https://angela2027.org/project2
- Project 3: https://angela2027.org/project3

## Deployment steps (GitHub Pages + custom domain)

1. Create a public GitHub repository that will host your site (for example: `angela2027.github.io` or any repo you link to your domain).
2. Extract all files from this zip into that repository (keeping the folder structure).
3. Commit and push to GitHub:
   - `git add .`
   - `git commit -m "Initial website for angela2027.org"`
   - `git push origin main`
4. In the repository settings, enable GitHub Pages and point it to the `main` branch root.
5. In your domain DNS (GoDaddy), point `angela2027.org` to GitHub Pages IPs and set the custom domain in GitHub Pages settings.
6. Once DNS and GitHub Pages are configured, the URLs above will be live.

You can add new projects by creating additional folders like `project4/` with their own `index.html`.
