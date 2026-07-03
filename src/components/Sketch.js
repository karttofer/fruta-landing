// Inlined into the page module (no import/export). It calls run(...) — which the page brings into scope
// via `use run from "~/lib/sketches.ts"` — to mount a live fruta canvas into this host element.
function mount(el, inputs) {
  run(el, inputs.name)
}
