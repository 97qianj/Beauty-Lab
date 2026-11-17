const fingers = [
  { name: 'Thumb', x: 92.3, y: 51.4, width: 8.6, height: 8.3, rotation: 23 },
  { name: 'Index', x: 72.6, y: 14.0, width: 7.4, height: 7.4, rotation: 2 },
  { name: 'Middle', x: 55.2, y: 7.2, width: 7.7, height: 8.7, rotation: 0 },
  { name: 'Ring', x: 39.7, y: 13.2, width: 7.1, height: 8.1, rotation: 3 },
  { name: 'Little', x: 20.6, y: 27.6, width: 5.4, height: 7.0, rotation: -3 },
];
const preview = document.querySelector('#hand-preview');
const picker = document.querySelector('#finger-picker');
const sample = document.querySelector('#polish-sample');
const controls = document.querySelector('#nail-tools');
const magnetic = document.querySelector('#magnetic');
const active = document.querySelector('#active-finger');
const status = document.querySelector('#nail-status');
const open = document.querySelector('#open-nails');
const storageKey = 'beauty-lab.nail-set.v1';
const defaultNail = {
  shape: 'oval', color: '#b56f7d', finish: 'gloss', decoration: 'none',
  coats: '2', angle: '45', width: '18', brightness: '72',
};
let selected = 2;
let nails = starterSet();
let saved = readSavedSet();

function starterSet() {
  return [
    { ...defaultNail, finish: 'jelly', coats: '1' },
    { ...defaultNail, decoration: 'french' },
    { ...defaultNail, color: '#803b55', finish: 'cat-eye' },
    { ...defaultNail, color: '#977db0', decoration: 'star' },
    { ...defaultNail, finish: 'matte' },
  ];
}

function readSavedSet() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(value) && value.length === fingers.length &&
      value.every((nail) => nail && Object.keys(defaultNail).every((key) => {
        const field = controls.elements.namedItem(key);
        return field.type === 'range'
          ? Number(nail[key]) >= Number(field.min) && Number(nail[key]) <= Number(field.max)
          : [...field.options].some((option) => option.value === nail[key]);
      }))
    ) return value;
  } catch {
    return null;
  }
  return null;
}

function paint(element, nail) {
  element.dataset.shape = nail.shape;
  element.dataset.finish = nail.finish;
  element.dataset.decoration = nail.decoration;
  const strength = { 1: 62, 2: 83, 3: 100 }[nail.coats];
  element.style.setProperty('--polish', `color-mix(in srgb, ${nail.color} ${strength}%, #eac5b1)`);
  element.style.setProperty('--angle', `${nail.angle}deg`);
  element.style.setProperty('--band', `${nail.width}%`);
  element.style.setProperty('--shine', Number(nail.brightness) / 100);
}

function render() {
  const nail = nails[selected];
  for (const [index, finger] of fingers.entries()) {
    paint(finger.tile, nails[index]);
    finger.tile.classList.toggle('active', selected === index);
    finger.button.setAttribute('aria-pressed', selected === index);
  }
  paint(sample, nail);
  magnetic.hidden = nail.finish !== 'cat-eye';
  active.textContent = `${fingers[selected].name} detail`;
}

function loadControls() {
  for (const [key, value] of Object.entries(nails[selected])) {
    controls.elements.namedItem(key).value = value;
  }
  render();
}

for (const [index, finger] of fingers.entries()) {
  const tile = document.createElement('span');
  tile.className = 'polish';
  tile.setAttribute('aria-hidden', 'true');
  tile.style.left = `${finger.x}%`;
  tile.style.top = `${finger.y}%`;
  tile.style.width = `${finger.width}%`;
  tile.style.height = `${finger.height}%`;
  tile.style.setProperty('--rotation', `${finger.rotation}deg`);
  preview.append(tile);
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = finger.name;
  button.addEventListener('click', () => {
    selected = index;
    loadControls();
  });
  picker.append(button);
  finger.tile = tile;
  finger.button = button;
}

controls.addEventListener('input', ({ target }) => {
  if (!Object.hasOwn(defaultNail, target.name)) return;
  nails[selected][target.name] = target.value;
  render();
});
document.querySelector('#copy-nail').addEventListener('click', () => {
  nails = fingers.map(() => ({ ...nails[selected] }));
  render();
  status.textContent = `${fingers[selected].name} settings applied to all five nails.`;
});
document.querySelector('#save-nails').addEventListener('click', () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nails));
    saved = structuredClone(nails);
    open.disabled = false;
    status.textContent = 'Set saved in this browser.';
  } catch {
    status.textContent = 'This browser could not save the set.';
  }
});
open.addEventListener('click', () => {
  nails = structuredClone(saved);
  loadControls();
  status.textContent = 'Saved set opened.';
});
document.querySelector('#reset-nails').addEventListener('click', () => {
  nails = starterSet();
  loadControls();
  status.textContent = 'Starting set restored.';
});

open.disabled = !saved;
loadControls();
