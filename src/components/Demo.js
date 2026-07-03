// Inlined into the page module. Mounts the selected example as a live fruta canvas, and re-mounts when the
// page's @current state changes (the returned updater). runExample comes from `use runExample` on the page.
function mount(el, inputs) {
  runExample(el, inputs.name)
  return (next) => runExample(el, next.name)
}
