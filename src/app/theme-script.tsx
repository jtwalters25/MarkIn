// Inline script to set theme before paint (no flash of wrong theme).
export default function ThemeScript() {
  const code = `
(function(){
  try {
    var t = localStorage.getItem('markin-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    if (t === 'light') document.documentElement.classList.add('light');
  } catch (e) {}
})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
