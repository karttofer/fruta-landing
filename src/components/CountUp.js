// CountUp - a muten Custom that animates a formatted stat from 0 to its target the first time it scrolls into
// view. inputs: { to } - the final display string (e.g. "2.4M", "94%", "120K", "58", "99.99%", "40ms", "12B").
// It splits an optional prefix + number (decimals/commas ok) + suffix, animates the number, then restores the
// EXACT target string so formatting like "2.4M" is preserved. Pure vanilla JS - this is muten's 20% escape for
// something CSS can't do (animating a formatted number). Respects prefers-reduced-motion.
export function mount(el, inputs) {
  const target = String(inputs && inputs.to != null ? inputs.to : '0');
  const m = target.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m) { el.textContent = target; return; }
  const prefix = m[1], numStr = m[2], suffix = m[3];
  const end = parseFloat(numStr.replace(/,/g, ''));
  const decimals = (numStr.split('.')[1] || '').length;
  const grouped = numStr.indexOf(',') !== -1;
  const fmt = (v) => prefix + (decimals ? v.toFixed(decimals) : (grouped ? Math.round(v).toLocaleString() : String(Math.round(v)))) + suffix;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window) || !isFinite(end)) { el.textContent = target; return; }

  el.textContent = fmt(0);
  let started = false;
  const run = () => {
    if (started) return; started = true;
    const dur = 1400, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      if (p < 1) { el.textContent = fmt(end * eased); requestAnimationFrame(tick); }
      else el.textContent = target; // land on the exact target (keeps "2.4M"/"99.99%" formatting)
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { run(); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(el);
}
