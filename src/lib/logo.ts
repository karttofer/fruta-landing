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
