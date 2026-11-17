const wardrobe = {
  top: [
    ['tee', 'White tee', 'mymee-tee.webp'],
    ['knit', 'Oat knit', 'mymee-knit.webp'],
    ['shirt', 'Blue shirt', 'case-assets/wardrobe-shirt.webp'],
  ],
  bottom: [
    ['jeans', 'Light jeans', 'case-assets/wardrobe-jeans.webp'],
    ['trousers', 'Black trousers', 'case-assets/wardrobe-trousers.webp'],
    ['skirt', 'Pleated skirt', 'case-assets/wardrobe-skirt.webp'],
  ],
  outer: [
    ['blazer', 'Black blazer', 'mymee-blazer.webp'],
    ['trench', 'Tan trench', 'mymee-trench.webp'],
  ],
  shoe: [
    ['sneakers', 'White sneakers', 'case-assets/wardrobe-sneakers.webp'],
    ['loafers', 'Brown loafers', 'case-assets/wardrobe-loafers.webp'],
  ],
  bag: [
    ['bag', 'Black shoulder bag', 'case-assets/wardrobe-bag.webp'],
    ['tote', 'Tan tote', 'case-assets/wardrobe-tote.webp'],
  ],
};
const startingPositions = {
  top: [31, 28, 38],
  bottom: [70, 52, 35],
  outer: [73, 23, 31],
  shoe: [29, 73, 32],
  bag: [49, 51, 24],
};
const samples = {
  weekend: [
    ['Weekend layers', { top: 'knit', bottom: 'jeans', shoe: 'sneakers', bag: 'tote' }],
    ['Coffee run', { top: 'tee', bottom: 'skirt', outer: 'trench', shoe: 'loafers', bag: 'bag' }],
  ],
  office: [
    ['Easy tailoring', { top: 'shirt', bottom: 'trousers', outer: 'blazer', shoe: 'loafers' }],
    ['Studio day', { top: 'knit', bottom: 'skirt', outer: 'trench', bag: 'tote' }],
  ],
};
const board = document.querySelector('#outfit-board');
const category = document.querySelector('#wardrobe-category');
const options = document.querySelector('#garment-options');
const pieceControls = document.querySelector('#piece-tools');
const pieceName = document.querySelector('#piece-name');
const status = document.querySelector('#outfit-status');
const occasion = document.querySelector('#occasion');
const suggest = document.querySelector('#suggest-look');
const restore = document.querySelector('#restore-look');
const sliders = [
  ['x', document.querySelector('#piece-x')],
  ['y', document.querySelector('#piece-y')],
  ['size', document.querySelector('#piece-size')],
];

const storageKey = 'beauty-lab.mymee-look.v1';
let pieces = [];
let selection;
let exampleIndex = -1;
let saved = readSavedLook();

function item(piece) {
  return wardrobe[piece.category].find(([id]) => id === piece.id);
}

function readSavedLook() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(value) && value.length <= Object.keys(wardrobe).length && value.every((piece) =>
      wardrobe[piece.category]?.some(([id]) => id === piece.id) &&
      sliders.every(([key, input]) => Number.isFinite(piece[key]) && piece[key] >= Number(input.min) && piece[key] <= Number(input.max))
    )) return value;
  } catch {
    return null;
  }
  return null;
}

function positionPiece(button, piece) {
  button.style.left = `${piece.x}%`;
  button.style.top = `${piece.y}%`;
  button.style.width = `${piece.size}%`;
}

function renderBoard() {
  board.replaceChildren();
  for (const piece of pieces) {
    const [, name, src] = item(piece);
    const button = document.createElement('button');
    const image = new Image();
    button.type = 'button';
    button.className = 'board-piece';
    button.dataset.category = piece.category;
    button.setAttribute('aria-label', `Select ${name}`);
    image.src = src;
    image.alt = '';
    button.append(image);
    positionPiece(button, piece);
    button.addEventListener('click', () => selectPiece(piece.category));
    enableDrag(button, piece);
    board.append(button);
  }
  selectPiece(selection);
}

function enableDrag(button, piece) {
  let origin;
  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    origin = { pointer: event.pointerId, x: event.clientX, y: event.clientY, left: piece.x, top: piece.y };
    selectPiece(piece.category);
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', (event) => {
    if (origin?.pointer !== event.pointerId) return;
    const dx = 100 * (event.clientX - origin.x) / board.clientWidth;
    const dy = 100 * (event.clientY - origin.y) / board.clientHeight;
    piece.x = Math.min(82, Math.max(18, Math.round(origin.left + dx)));
    piece.y = Math.min(82, Math.max(18, Math.round(origin.top + dy)));
    positionPiece(button, piece);
    sliders[0][1].value = piece.x;
    sliders[1][1].value = piece.y;
  });
  button.addEventListener('lostpointercapture', () => { origin = undefined; });
}

function selectPiece(key) {
  selection = key;
  const piece = pieces.find((entry) => entry.category === selection);
  for (const button of board.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.category === selection);
  }
  pieceControls.disabled = !piece;
  pieceName.textContent = piece ? `Adjust ${item(piece)[1]}` : 'Select a piece to adjust';
  if (piece) {
    for (const [property, input] of sliders) input.value = piece[property];
  }
}

function renderOptions() {
  const key = category.value;
  options.replaceChildren();
  for (const [id, name, src] of wardrobe[key]) {
    const button = document.createElement('button');
    const image = new Image();
    button.type = 'button';
    image.src = src;
    image.alt = '';
    button.append(image, name);
    button.addEventListener('click', () => {
      const existing = pieces.find((piece) => piece.category === key);
      if (existing) existing.id = id;
      else pieces.push(makePiece(key, id));
      selection = key;
      renderBoard();
      status.textContent = `${name} is on the board.`;
    });
    options.append(button);
  }
}

function makePiece(key, id) {
  const [x, y, size] = startingPositions[key];
  return { category: key, id, x, y, size };
}

function loadLook(look) {
  pieces = Object.entries(look).map(([key, id]) => makePiece(key, id));
  selection = pieces[0]?.category;
  renderBoard();
}

for (const [property, input] of sliders) {
  input.addEventListener('input', () => {
    const piece = pieces.find((entry) => entry.category === selection);
    piece[property] = Number(input.value);
    positionPiece(board.querySelector(`[data-category="${selection}"]`), piece);
  });
}

category.addEventListener('change', renderOptions);
occasion.addEventListener('change', () => {
  exampleIndex = -1;
  suggest.textContent = 'Load sample look';
});
suggest.addEventListener('click', () => {
  const looks = samples[occasion.value];
  exampleIndex = (exampleIndex + 1) % looks.length;
  const [name, look] = looks[exampleIndex];
  loadLook(look);
  suggest.textContent = 'Try another look';
  status.textContent = `${name} · ${exampleIndex + 1} of ${looks.length}`;
});

document.querySelector('#piece-front').addEventListener('click', () => {
  const index = pieces.findIndex((piece) => piece.category === selection);
  pieces.push(...pieces.splice(index, 1));
  renderBoard();
  status.textContent = 'Selected piece brought to the front.';
});
document.querySelector('#piece-remove').addEventListener('click', () => {
  pieces = pieces.filter((piece) => piece.category !== selection);
  selection = pieces.at(-1)?.category;
  renderBoard();
  status.textContent = 'Piece removed.';
});
document.querySelector('#save-look').addEventListener('click', () => {
  if (pieces.length === 0) {
    status.textContent = 'Add a piece before saving.';
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(pieces));
    saved = structuredClone(pieces);
    restore.disabled = false;
    status.textContent = 'Look saved in this browser.';
  } catch {
    status.textContent = 'This browser could not save the look.';
  }
});
restore.addEventListener('click', () => {
  pieces = structuredClone(saved);
  selection = pieces[0]?.category;
  renderBoard();
  status.textContent = 'Saved look opened.';
});
document.querySelector('#reset-look').addEventListener('click', () => {
  loadLook(samples.weekend[0][1]);
  status.textContent = 'Board reset to the starting look.';
});

restore.disabled = !saved;
renderOptions();
loadLook(samples.weekend[0][1]);
