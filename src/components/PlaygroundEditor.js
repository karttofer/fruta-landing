// The p5.js-style playground editor (muten Custom). mountEditor is a page use-fn (global here) that builds the
// whole DOM editor — toolbar, Monaco, live preview, console. Self-cleans on route change.
export function mount(el) {
  const inst = mountEditor(el);
  const mo = new MutationObserver(() => {
    if (!el.isConnected) { inst.destroy(); mo.disconnect(); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
