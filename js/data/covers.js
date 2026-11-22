// The painting that stands for each Kāṇḍa: on its card in the gallery, on its title page in the book, and on the
// stage whenever the book shows a page without a paragraph. 'idle' is the stage before the book is opened.
export const COVER = {
  prologue: 'prologue-1-2-0', bala: 'bala-15-2-1', ayodhya: 'ayodhya-18-1-1', aranya: 'aranya-8-0-0',
  kishkindha: 'kishkindha-1-0-1', sundara: 'sundara-1-0-2', yuddha: 'yuddha-15-1-1', uttara: 'uttara-15-2-1', idle: 'site-0-0-2'
};
// bumped whenever covers are re-painted, so browsers fetch the new picture
export const CV = '20261121c';
export const coverSrc = id => `ill/${COVER[id] || COVER.idle}.webp?v=${CV}`;
