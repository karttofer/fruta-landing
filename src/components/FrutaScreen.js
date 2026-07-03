// Generic full-page fruta screen (muten Custom). input: { page } → "docs" | "examples" | "playground".
// paintScreen is a page use-fn (global here). Self-cleans when el leaves the DOM (route change) so the fruta
// rAF loop + listeners + any overlay nodes don't leak.
export function mount(el, inputs) {
  const inst = paintScreen(el, String(inputs.page || "docs"));
  const mo = new MutationObserver(() => {
    if (!el.isConnected) { inst.destroy(); mo.disconnect(); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
