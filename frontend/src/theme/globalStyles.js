const globalCss = `
:root {
  --ink: #0E1116;
  --paper: #F6F7F9;
  --signal: #C6F432;
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  margin: 0;
  background: #F6F7F9;
  color: #101828;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
h1, h2, h3, h4 { margin: 0; font-family: 'Bricolage Grotesque', 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; line-height: 1.12; }
p { margin: 0; }
a { color: inherit; }
img, svg { max-width: 100%; }
button, input, textarea, select { font-family: inherit; font-size: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid #0E1116; outline-offset: 2px; }
::selection { background: #C6F432; color: #0E1116; }

@keyframes sn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes sn-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sn-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
`;

export default globalCss;