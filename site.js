const wardrobe = document.querySelector('#wardrobe-choices');
const garment = document.querySelector('#garment');

wardrobe.addEventListener('change', (event) => {
  const choice = event.target;
  garment.src = `mymee-${choice.value}.webp`;
  garment.alt = choice.labels[0].textContent.trim();
});

const nail = document.querySelector('#nail-sample');
const shape = document.querySelector('#nail-shape');
const color = document.querySelector('#nail-color');
const finish = document.querySelector('#nail-finish');

function renderNail() {
  nail.dataset.shape = shape.value;
  nail.dataset.finish = finish.value;
  nail.style.setProperty('--polish', color.value);
}

document.querySelector('.nail-options').addEventListener('change', renderNail);

const storyPages = [
  {
    alt: 'A warmly lit cottage under a crescent moon',
    text: 'Night had arrived.\nOutside, the wind whispered past the windows.\nInside the little house, one warm light was still glowing.',
  },
  {
    alt: 'Four friends spend the evening together in the living room',
    text: 'Millie was sprawled on the rug, sketching a plan.\nDoodoo was curled on the sofa with one eye barely open.\nBippo was rolling in tiny circles.\nMooMoo was checking the windows, the outlets, and every suspicious blanket corner.',
  },
  {
    alt: 'Millie presents her indoor camping idea to her friends',
    text: '“I have a brilliant idea!” Millie cried.\nShe held up her drawing like it was a map to treasure.\n“Let’s go camping tonight. Right here in the living room! And I can invent an automatic light-turner-offer!”',
  },
  {
    alt: 'Doodoo reacts to the indoor camping idea',
    text: 'Doodoo lifted one sleepy eyelid.\n“Indoor camping?” he said. “Isn’t that just sleeping in a different inconvenient place?”',
  },
  {
    alt: 'Bippo raises a hand in excitement',
    text: 'Bippo’s hand shot up.\n“Great idea! Outstanding idea! Zero wind! Very few mosquitoes! Happiness level climbing!”\nMooMoo nodded slowly. “Hmm. This plan has acceptable fluff potential.”',
  },
];

const storyArt = document.querySelector('#story-art');
const storyText = document.querySelector('#story-text');
const storyPosition = document.querySelector('#story-position');
const previous = document.querySelector('#story-prev');
const next = document.querySelector('#story-next');
let currentPage = 0;

function showPage(index) {
  if (index < 0 || index >= storyPages.length) return;
  currentPage = index;
  const page = storyPages[index];
  storyArt.src = `story-${index + 1}.webp`;
  storyArt.alt = page.alt;
  storyText.textContent = page.text;
  storyPosition.textContent = `${index + 1} / ${storyPages.length}`;
  const activeControl = document.activeElement;
  previous.disabled = index === 0;
  next.disabled = index === storyPages.length - 1;
  if (activeControl === previous && previous.disabled) next.focus();
  if (activeControl === next && next.disabled) previous.focus();
}

previous.addEventListener('click', () => showPage(currentPage - 1));
next.addEventListener('click', () => showPage(currentPage + 1));

window.addEventListener('pageshow', () => {
  const selected = wardrobe.querySelector('input:checked');
  garment.src = `mymee-${selected.value}.webp`;
  garment.alt = selected.labels[0].textContent.trim();
  renderNail();
  showPage(currentPage);
});
