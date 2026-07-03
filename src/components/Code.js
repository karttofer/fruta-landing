// Code block host (muten Custom). input: { name } — a snippet key ("hero"|"loop"|"draw"|"input"). muten can't
// pass a use-fn result into a Custom input, so the page `use`s codeSnippet (a global here, like ExCode's
// exampleHtml) and we resolve + highlight by name. hljs is lazy-loaded (dynamic import — Customs can't use
// static top-level imports, muten inlines them). GitHub-Dark palette via .hljs-* in styles.css, on a dark card.
export function mount(el, inputs) {
  el.style.cssText = "border-radius:14px; background:#0d1117; border:1px solid #1f2937; padding:16px 18px; overflow:auto";
  const pre = document.createElement("pre");
  pre.className = "m-0 text-sm leading-relaxed";
  const code = document.createElement("code");
  code.className = "hljs";
  pre.appendChild(code);
  el.appendChild(pre);

  const render = (name) => {
    const raw = codeSnippet(String(name == null ? "" : name));  // codeSnippet: page use-fn (global)
    code.textContent = raw;                                      // plain until the highlighter loads (progressive)
    import("../lib/highlight").then((m) => { code.innerHTML = m.highlightTS(raw); }).catch(() => {});
  };
  render(inputs.name);
  return (next) => render(next.name);
}
