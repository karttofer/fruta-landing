// The fruta cherry logo, as one SVG used everywhere (crisp + identical across OSes, unlike the 🍒 emoji). DOM
// navs use LOGO_URL in an <img>; canvas navs drawImage the preloaded logoImage() (falling back to drawn cherries
// for the first frame until it decodes).
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 2 34 35">
<g fill="none" stroke="#1a1613" stroke-width="2.4" stroke-linecap="round"><path d="M13 27C12 20 19 15 23 9"/><path d="M27 28C28 21 25 15 23 9"/></g>
<path d="M23 9C27 4 34 5 36 10C31 12 25 11 23 9Z" fill="#5f7a3a" stroke="#1a1613" stroke-width="1.8" stroke-linejoin="round"/>
<circle cx="12.5" cy="28.5" r="7.2" fill="#cf3b25" stroke="#1a1613" stroke-width="2.4"/>
<circle cx="27" cy="29.5" r="6.6" fill="#df728c" stroke="#1a1613" stroke-width="2.4"/>
<circle cx="10.4" cy="26.4" r="1.5" fill="#ffffff" opacity="0.65"/></svg>`

export const LOGO_URL = 'data:image/svg+xml,' + encodeURIComponent(LOGO_SVG)
export const LOGO_SIZE = 30                                       // one size for the logo everywhere (canvas + DOM)

let _img: any = null
export function logoImage(): any {
  if (typeof Image === 'undefined') return null
  if (!_img) { _img = new Image(); _img.src = LOGO_URL }
  return _img
}

// The muten logo (from src/assets/logos/muten.svg — the clean rounded-square mark), inlined as a data URL so it
// stays crisp/vector and doesn't depend on public/ serving. For the "powered by muten" footer.
export const MUTEN_SVG = `<svg width="157" height="157" viewBox="0 0 157 157" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="157" height="157" rx="12" fill="#FF5E00"/><path d="M40 144.727V74.9091H61.1364V87.7273H61.9091C63.3636 83.4848 65.8182 80.1364 69.2727 77.6818C72.7273 75.2273 76.8485 74 81.6364 74C86.4848 74 90.6364 75.2424 94.0909 77.7273C97.5455 80.2121 99.7424 83.5455 100.682 87.7273H101.409C102.712 83.5758 105.258 80.2576 109.045 77.7727C112.833 75.2576 117.303 74 122.455 74C129.061 74 134.424 76.1212 138.545 80.3636C142.667 84.5758 144.727 90.3636 144.727 97.7273V144.727H122.5V102.818C122.5 99.3333 121.606 96.6818 119.818 94.8636C118.03 93.0152 115.712 92.0909 112.864 92.0909C109.803 92.0909 107.394 93.0909 105.636 95.0909C103.909 97.0606 103.045 99.7121 103.045 103.045V144.727H81.6818V102.591C81.6818 99.3485 80.803 96.7879 79.0455 94.9091C77.2879 93.0303 74.9697 92.0909 72.0909 92.0909C70.1515 92.0909 68.4394 92.5606 66.9545 93.5C65.4697 94.4091 64.303 95.7121 63.4545 97.4091C62.6364 99.1061 62.2273 101.106 62.2273 103.409V144.727H40Z" fill="white"/></svg>`
export const MUTEN_URL = 'data:image/svg+xml,' + encodeURIComponent(MUTEN_SVG)
let _muten: any = null
export function mutenLogoImage(): any {
  if (typeof Image === 'undefined') return null
  if (!_muten) { _muten = new Image(); _muten.src = MUTEN_URL }
  return _muten
}
