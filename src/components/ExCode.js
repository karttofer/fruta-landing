// Examples code viewer (muten Custom). Takes the example `name`, renders its highlighted TypeScript source
// (exampleHtml is a use-fn from ~/lib/examples.ts, available in scope). Re-renders when @current changes.
export function mount(el, inputs) {
  el.className = "code-body";
  const pre = document.createElement("pre");
  pre.className = "m-0";
  const code = document.createElement("code");
  code.className = "hljs";
  code.innerHTML = exampleHtml(inputs.name);
  pre.appendChild(code);
  el.appendChild(pre);
  return (next) => { code.innerHTML = exampleHtml(next.name); };
}
