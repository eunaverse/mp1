// 1. Keep the navigation in sync with the visible section.
const header = document.querySelector("#site-header");
const navLinks = [...document.querySelectorAll("a[data-nav]")];
const sections = [...document.querySelectorAll("[data-section]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollFramePending = false;

function updateNavigation() {
  header.classList.toggle("is-compact", window.scrollY > 32);

  const readingLine = header.getBoundingClientRect().bottom + 2;
  let currentSection = sections[0];

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= readingLine) {
      currentSection = section;
    }
  });

  // The final section can be too short to reach the top of the viewport.
  const atBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2;
  if (atBottom) currentSection = sections[sections.length - 1];

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${currentSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function requestNavigationUpdate() {
  if (scrollFramePending) return;

  scrollFramePending = true;
  window.requestAnimationFrame(() => {
    updateNavigation();
    scrollFramePending = false;
  });
}

function scrollToSection(section, smooth = true) {
  // Change the header first, then measure its real desktop or mobile height.
  header.classList.toggle("is-compact", section.id !== "home");
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  const top =
    section.id === "home"
      ? 0
      : sectionTop - header.getBoundingClientRect().height;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth && !reducedMotion.matches ? "smooth" : "instant",
  });
  requestNavigationUpdate();
}

document.querySelectorAll("a[data-nav], a[data-scroll]").forEach((link) => {
  link.addEventListener("click", (event) => {
    // Preserve normal browser behavior for opening a link in a new tab.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const hash = link.getAttribute("href");
    const section = document.getElementById(hash.slice(1));
    if (!section) return;

    event.preventDefault();
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    scrollToSection(section);
  });
});

function followHash() {
  const id = window.location.hash.slice(1) || "home";
  const section = sections.find((item) => item.id === id);
  if (section) scrollToSection(section, false);
}

window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
window.addEventListener("resize", requestNavigationUpdate);
window.addEventListener("hashchange", followHash);
window.addEventListener("load", () => {
  if (window.location.hash) followHash();
  else updateNavigation();
});
updateNavigation();

// 2. Show one journey at a time, with wrapping previous/next controls.
const carousel = document.querySelector("[data-carousel]");
const slides = [...carousel.querySelectorAll("[data-slide]")];
const slideButtons = [...carousel.querySelectorAll("[data-slide-to]")];
const carouselStatus = carousel.querySelector("[data-carousel-status]");
let currentSlide = 0;

function showSlide(index) {
  const focusWasInsideSlide = slides[currentSlide].contains(
    document.activeElement
  );
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.hidden = slideIndex !== currentSlide;
  });
  if (focusWasInsideSlide) carousel.focus({ preventScroll: true });
  slideButtons.forEach((button, buttonIndex) => {
    button.setAttribute("aria-pressed", String(buttonIndex === currentSlide));
  });

  const position = String(currentSlide + 1).padStart(2, "0");
  const total = String(slides.length).padStart(2, "0");
  carouselStatus.textContent = `${position} / ${total}`;
}

carousel.querySelector("[data-carousel-prev]").addEventListener("click", () => {
  showSlide(currentSlide - 1);
});
carousel.querySelector("[data-carousel-next]").addEventListener("click", () => {
  showSlide(currentSlide + 1);
});
slideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSlide(Number(button.dataset.slideTo));
  });
});
carousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showSlide(currentSlide + (event.key === "ArrowRight" ? 1 : -1));
  }
});
showSlide(0);

// 3. Open each journal note in an accessible native modal dialog.
const notes = {
  slow: {
    title: "Leave room to get lost",
    body: "A fictional field note about doing less: choose one place for the morning, then leave the afternoon open. A long walk can be the whole plan.",
    tips: [
      "Pick one neighborhood instead of crossing the whole city.",
      "Save an offline map before setting out.",
      "Leave time to sit, sketch, or simply watch the street.",
    ],
  },
  pack: {
    title: "Carry a little less",
    body: "Pack for the day you want to have. A smaller bag leaves more room for an unplanned stop, a quiet train ride, or a walk that lasts longer than expected.",
    tips: [
      "Start with comfortable shoes and a refillable water bottle.",
      "Bring a light layer and check the local forecast.",
      "Keep a notebook handy for details a camera might miss.",
    ],
  },
  notice: {
    title: "Notice the small things",
    body: "A journey is made of ordinary details: a painted door, the sound of rain, the shape of a handwritten sign. Choose a few to remember at the end of the day.",
    tips: [
      "Write down one color, one sound, and one small surprise.",
      "Ask permission before photographing people.",
      "Describe the moment in your own words while it is still fresh.",
    ],
  },
};
const noteDialog = document.querySelector("#note-dialog");
const noteTitle = document.querySelector("#note-title");
const noteBody = document.querySelector("#note-body");
const noteExtra = document.querySelector("#note-extra");
let noteOpener = null;

document.querySelectorAll("[data-open-note]").forEach((button) => {
  button.addEventListener("click", () => {
    const note = notes[button.dataset.openNote];
    if (!note) return;

    noteTitle.textContent = note.title;
    noteBody.textContent = note.body;
    const list = document.createElement("ul");
    note.tips.forEach((tip) => {
      const item = document.createElement("li");
      item.textContent = tip;
      list.append(item);
    });
    noteExtra.replaceChildren(list);

    noteOpener = button;
    document.body.classList.add("modal-open");
    noteDialog.showModal();
  });
});

noteDialog.querySelector("[data-close-note]").addEventListener("click", () => {
  noteDialog.close();
});
noteDialog.addEventListener("click", (event) => {
  const bounds = noteDialog.getBoundingClientRect();
  const outside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (event.target === noteDialog && outside) noteDialog.close();
});
// Escape closes a native dialog automatically and also fires this event.
noteDialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (noteOpener) noteOpener.focus({ preventScroll: true });
});
