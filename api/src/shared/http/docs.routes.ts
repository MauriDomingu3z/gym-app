import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { marked } from "marked";

/**
 * Sirve la documentación de la API (api/docs/*.md) como páginas HTML simples.
 * Puramente presentacional: lee un .md, lo renderiza con `marked` y lo envuelve
 * en una página autocontenida (sin CDN ni fuentes externas). No tiene lógica de
 * negocio ni toca ningún endpoint existente.
 */

const DOCS_DIR = path.resolve(process.cwd(), "docs");

const PAGES: Record<string, string> = {
  index: "Gym App API — Documentación",
  autenticacion: "Autenticación",
  ejercicios: "Ejercicios",
  entrenamientos: "Entrenamientos",
  favoritos: "Favoritos",
};

function renderPage(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · Gym App API</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff;
    --fg: #1c1c1e;
    --muted: #6b7280;
    --border: #e5e7eb;
    --code-bg: #f3f4f6;
    --link: #2563eb;
    --header-bg: #fafafa;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #15151a;
      --fg: #e5e7eb;
      --muted: #9ca3af;
      --border: #2e2e35;
      --code-bg: #1e1e24;
      --link: #60a5fa;
      --header-bg: #1a1a20;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
  }
  nav {
    background: var(--header-bg);
    border-bottom: 1px solid var(--border);
    padding: 0.75rem 1.5rem;
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
  }
  nav a { color: var(--muted); text-decoration: none; }
  nav a:hover { color: var(--link); text-decoration: underline; }
  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  h1, h2, h3 { line-height: 1.3; }
  h1 { font-size: 1.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
  h2 { font-size: 1.3rem; margin-top: 2.5rem; }
  h3 {
    font-size: 1.05rem;
    margin-top: 2rem;
    background: var(--code-bg);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }
  a { color: var(--link); }
  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    background: var(--code-bg);
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
  }
  pre code { background: none; padding: 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    font-size: 0.92rem;
    display: block;
    overflow-x: auto;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 0.5rem 0.75rem;
    text-align: left;
  }
  th { background: var(--code-bg); }
  hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }
  blockquote {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 3px solid var(--border);
    color: var(--muted);
  }
</style>
</head>
<body>
<nav>
  <a href="/docs">Índice</a>
  <a href="/docs/autenticacion">Autenticación</a>
  <a href="/docs/ejercicios">Ejercicios</a>
  <a href="/docs/entrenamientos">Entrenamientos</a>
  <a href="/docs/favoritos">Favoritos</a>
</nav>
<main>
${bodyHtml}
</main>
</body>
</html>`;
}

function renderMarkdownFile(res: import("express").Response, slug: string): void {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    res.status(404).send(renderPage("No encontrado", "<h1>404</h1><p>Esa página de documentación no existe.</p>"));
    return;
  }

  const markdown = fs.readFileSync(filePath, "utf-8");
  const bodyHtml = marked.parse(markdown, { async: false }) as string;
  res.type("html").send(renderPage(PAGES[slug] ?? slug, bodyHtml));
}

export const docsRouter = Router();

docsRouter.get("/", (_req, res) => {
  renderMarkdownFile(res, "index");
});

docsRouter.get("/:page", (req, res) => {
  const page = req.params.page as string;
  renderMarkdownFile(res, page);
});
