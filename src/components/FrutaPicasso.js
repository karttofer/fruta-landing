// Full-page cubist fruta landing (muten Custom). paintLanding is a page use-fn (a global here, like the
// sketches' run). muten doesn't signal Custom unmount, so we self-clean when el leaves the DOM (route change):
// otherwise the fruta rAF loop + resize listener would leak.
export function mount(el) {
  const inst = paintLanding(el);
  const mo = new MutationObserver(() => {
    if (!el.isConnected) { inst.destroy(); mo.disconnect(); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
