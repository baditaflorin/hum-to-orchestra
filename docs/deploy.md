# Deployment

Mode: A, pure GitHub Pages.

Live URL: https://baditaflorin.github.io/hum-to-orchestra/

Repository: https://github.com/baditaflorin/hum-to-orchestra

## Publish Strategy

GitHub Pages serves the `main` branch from the `/docs` folder.

Build command:

```bash
npm run build
git add docs
git commit -m "chore: publish pages build"
git push origin main
```

## Manual Rollback

Revert the commit that changed `docs/`, then push `main`.

```bash
git revert <publishing_commit_sha>
git push origin main
```

## Custom Domain

No custom domain is configured in v0.1.0.

If a domain is added later:

- Add `docs/CNAME`.
- Configure DNS with the GitHub Pages records documented at https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- Rebuild and push.

## Pages Gotchas

- GitHub Pages does not support `_headers` or `_redirects`.
- SPA fallback is handled by copying `docs/index.html` to `docs/404.html`.
- The Vite base path is `/hum-to-orchestra/`.
- The service worker scope is `/hum-to-orchestra/`.
