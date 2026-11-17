const bannerTrack = document.querySelector("#bannerTrack");
const bannerPrev = document.querySelector("#bannerPrev");
const bannerNext = document.querySelector("#bannerNext");
const bannerDots = [...document.querySelectorAll("#bannerDots button")];
const bannerSection = document.querySelector(".banner-section");
const bannerSlides = [...document.querySelectorAll(".banner-slide")];
const bookSearch = document.querySelector("#bookSearch");
const bookItems = [...document.querySelectorAll("#bookGrid > .book-card, #bookGrid > .book-slot")];
const pageButtons = [...document.querySelectorAll("#pageNumbers button")];
const prevBooks = document.querySelector("#prevBooks");
const nextBooks = document.querySelector("#nextBooks");

let currentBanner = 0;
let bannerTimer;
let currentBookPage = 0;

function showBanner(index) {
  currentBanner = (index + bannerDots.length) % bannerDots.length;
  bannerTrack.style.transform = `translateX(-${currentBanner * 20}%)`;
  bannerDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentBanner);
  });
  bannerSection.style.setProperty("--banner-accent", bannerSlides[currentBanner].dataset.accent || "112, 86, 48");
}

function startBannerTimer() {
  window.clearInterval(bannerTimer);
  bannerTimer = window.setInterval(() => showBanner(currentBanner + 1), 5200);
}

function renderBookPage() {
  pageButtons.forEach((button, index) => button.classList.toggle("active", index === currentBookPage));
  prevBooks.disabled = currentBookPage === 0;
  nextBooks.disabled = currentBookPage === pageButtons.length - 1;
}

function filterBooks() {
  const query = bookSearch.value.trim().toLowerCase();
  bookItems.forEach((item) => {
    item.hidden = query && !item.dataset.title.includes(query);
  });
}

bannerPrev.addEventListener("click", () => {
  showBanner(currentBanner - 1);
  startBannerTimer();
});

bannerNext.addEventListener("click", () => {
  showBanner(currentBanner + 1);
  startBannerTimer();
});

bannerDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showBanner(index);
    startBannerTimer();
  });
});

pageButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    currentBookPage = index;
    renderBookPage();
  });
});

prevBooks.addEventListener("click", () => {
  currentBookPage = Math.max(currentBookPage - 1, 0);
  renderBookPage();
});

nextBooks.addEventListener("click", () => {
  currentBookPage = Math.min(currentBookPage + 1, pageButtons.length - 1);
  renderBookPage();
});

bookSearch.addEventListener("input", filterBooks);

showBanner(0);
startBannerTimer();
renderBookPage();
