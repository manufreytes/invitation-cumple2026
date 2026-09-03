/* =========================================================
   CONFIGURACIÓN DEL RSVP (Google Apps Script → tu planilla)
   -----------------------------------------------------------
   La URL de acá abajo es la de un Apps Script publicado como
   "Aplicación web" (Extensiones → Apps Script, dentro de tu
   planilla de Google Sheets) que recibe el nombre y la
   asistencia y los agrega como fila nueva. Si alguna vez tenés
   que rehacerlo, la URL termina en "/exec".
   ========================================================= */
const RSVP_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbywh9M5b6-SwSnHWumMPIzf4Uuy4hvEUByCvLMhnN_m-3TB6duei9muve-nFig3xtVAkg/exec";

const NAME_MAX_LEN = 20;

function isFormConfigured() {
  return !RSVP_ENDPOINT.includes("REEMPLAZAR");
}

function submitToGoogleForm(nombre, asistencia) {
  if (!isFormConfigured()) {
    console.warn("RSVP no configurado todavía.");
    return;
  }

  const params = new URLSearchParams();
  params.append("nombre", nombre);
  params.append("asistencia", asistencia);

  // "no-cors": no podemos leer la respuesta, pero el envío llega igual
  // y el Apps Script lo agrega a la planilla.
  fetch(RSVP_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    keepalive: true,
  }).catch(() => {
    /* no hay forma de saber si falló por el modo no-cors; seguimos igual */
  });
}

/* ---------------- Libro: abrir tapa ---------------- */
const book = document.getElementById("book");
const cover = document.getElementById("cover");
let opened = false;

function openBook() {
  if (opened) return;
  opened = true;
  cover.classList.add("open");
  setTimeout(() => {
    document.getElementById("photos").scrollIntoView({ behavior: "smooth" });
  }, 650);
}

cover.addEventListener("click", openBook);
cover.addEventListener("touchend", (e) => {
  e.preventDefault();
  openBook();
});

/* ---------------- Chispas flotantes en la tapa ---------------- */
(function sparkles() {
  const layer = document.querySelector(".sparkles");
  if (!layer) return;
  const count = 16;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.bottom = -10 - Math.random() * 20 + "px";
    s.style.animationDelay = Math.random() * 7 + "s";
    s.style.animationDuration = 6 + Math.random() * 4 + "s";
    layer.appendChild(s);
  }
})();

/* ---------------- Reveal on scroll ---------------- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.35 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
}

/* ---------------- Visor de fotos: swipe/tap obligatorio + aviso final ---------------- */
(function photoViewerSetup() {
  const photosSection = document.getElementById("photos");
  const viewer = document.getElementById("photoViewer");
  if (!photosSection || !viewer) return;

  const slides = Array.from(viewer.querySelectorAll(".photo-slide"));
  const TOTAL_PHOTOS = slides.length - 1; // la última slide es el aviso
  const carouselIndexEl = document.getElementById("carouselIndex");
  const counterWrap = document.getElementById("carouselCounter");
  const hint = document.getElementById("viewerHint");
  const gateCheck = document.getElementById("photosGateCheck");
  const gateBtn = document.getElementById("photosGateBtn");

  let slideIndex = 1;
  let gatePassed = false;
  let photosInView = false;

  function render() {
    slides.forEach((el) => {
      const i = Number(el.dataset.i);
      el.classList.remove("is-active", "is-before");
      if (i === slideIndex) el.classList.add("is-active");
      else if (i < slideIndex) el.classList.add("is-before");
    });
    if (slideIndex <= TOTAL_PHOTOS) {
      if (carouselIndexEl) carouselIndexEl.textContent = String(slideIndex);
      if (counterWrap) counterWrap.style.display = "";
      if (hint) hint.style.display = "";
    } else {
      if (counterWrap) counterWrap.style.display = "none";
      if (hint) hint.style.display = "none";
    }
  }

  function goTo(i) {
    slideIndex = Math.min(Math.max(i, 1), TOTAL_PHOTOS + 1);
    render();
  }
  function nextSlide() {
    if (!gatePassed) goTo(slideIndex + 1);
  }
  function prevSlide() {
    if (!gatePassed) goTo(slideIndex - 1);
  }
  function isInGateControls(target) {
    return !!(target && target.closest && target.closest(".gate-card"));
  }

  render();

  /* swipe táctil */
  let touchStartY = null;
  viewer.addEventListener(
    "touchstart",
    (e) => {
      if (gatePassed) return;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  viewer.addEventListener(
    "touchmove",
    (e) => {
      if (gatePassed) return;
      e.preventDefault();
    },
    { passive: false }
  );
  viewer.addEventListener("touchend", (e) => {
    if (gatePassed || touchStartY === null) return;
    const endY = e.changedTouches[0].clientY;
    const delta = touchStartY - endY;
    touchStartY = null;
    if (Math.abs(delta) > 30) {
      e.preventDefault();
      if (delta > 0) nextSlide();
      else prevSlide();
      return;
    }
    if (isInGateControls(e.target)) return;
    e.preventDefault();
    const x = e.changedTouches[0].clientX;
    if (x < window.innerWidth * 0.35) prevSlide();
    else nextSlide();
  });

  /* click (mouse / trackpad) */
  viewer.addEventListener("click", (e) => {
    if (gatePassed) return;
    if (isInGateControls(e.target)) return;
    if (e.clientX < window.innerWidth * 0.35) prevSlide();
    else nextSlide();
  });

  /* rueda / trackpad — un gesto (con toda su inercia) cuenta como un solo paso */
  let wheelLocked = false;
  let wheelAccum = 0;
  let wheelResetTimer = null;
  viewer.addEventListener(
    "wheel",
    (e) => {
      if (gatePassed) return;
      e.preventDefault();
      if (wheelLocked) return;

      wheelAccum += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelAccum = 0;
      }, 150);

      const THRESHOLD = 40;
      if (Math.abs(wheelAccum) < THRESHOLD) return;

      if (wheelAccum > 0) nextSlide();
      else prevSlide();

      wheelAccum = 0;
      wheelLocked = true;
      setTimeout(() => {
        wheelLocked = false;
      }, 700);
    },
    { passive: false }
  );

  /* teclado */
  const NAV_KEYS = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "PageDown", "PageUp", " "];
  window.addEventListener("keydown", (e) => {
    if (!photosInView || gatePassed) return;
    if (NAV_KEYS.includes(e.key)) {
      e.preventDefault(); // que la flecha no scrollee el libro entero de largo
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") prevSlide();
  });

  /* saber si la sección de fotos está en pantalla */
  if ("IntersectionObserver" in window) {
    const viewIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          photosInView = entry.isIntersecting;
        });
      },
      { threshold: 0.5 }
    );
    viewIO.observe(photosSection);
  } else {
    photosInView = true;
  }

  /* aviso final: checkbox habilita el botón */
  if (gateCheck && gateBtn) {
    gateCheck.addEventListener("change", () => {
      gateBtn.disabled = !gateCheck.checked;
      gateBtn.classList.toggle("is-enabled", gateCheck.checked);
    });
    gateBtn.addEventListener("click", () => {
      if (gateBtn.disabled) return;
      gatePassed = true;
      document.getElementById("video").scrollIntoView({ behavior: "smooth" });
    });
  }
})();

/* ---------------- Confetti ---------------- */
function launchConfetti() {
  const layer = document.getElementById("confettiLayer");
  if (!layer) return;
  const colors = ["#c1683f", "#e0ab5c", "#6f6b3b", "#4f7a4a", "#e3d0ab"];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}

/* ---------------- RSVP ---------------- */
const rsvpName = document.getElementById("rsvpName");
const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");
const rsvpStatus = document.getElementById("rsvpStatus");
const inviteCard = document.getElementById("inviteCard");

const STORAGE_KEY = "cumple-manu-rsvp";

if (rsvpName) {
  rsvpName.addEventListener("input", () => {
    if (rsvpName.value.length > NAME_MAX_LEN) {
      rsvpName.value = rsvpName.value.slice(0, NAME_MAX_LEN);
    }
  });
}

function paintStatus(kind, nombre) {
  inviteCard.classList.remove("confirmed-yes", "confirmed-no");
  rsvpStatus.classList.remove("yes", "no");
  rsvpStatus.classList.add("show");

  if (kind === "yes") {
    inviteCard.classList.add("confirmed-yes");
    rsvpStatus.classList.add("yes");
    rsvpStatus.textContent = `🎉 ¡Gracias${nombre ? ", " + nombre : ""}! Te esperamos el 19/9, no te olvides de los colores tierra 🌾`;
    launchConfetti();
  } else {
    inviteCard.classList.add("confirmed-no");
    rsvpStatus.classList.add("no");
    rsvpStatus.textContent = `Una pena que no puedas venir${nombre ? ", " + nombre : ""} 😢 ¡Va a haber otra!`;
  }
}

function handleRSVP(kind) {
  const nombre = rsvpName.value.trim().slice(0, NAME_MAX_LEN);
  if (!nombre) {
    rsvpName.focus();
    rsvpName.style.borderColor = "var(--red)";
    setTimeout(() => (rsvpName.style.borderColor = ""), 1500);
    return;
  }
  paintStatus(kind, nombre);
  submitToGoogleForm(nombre, kind === "yes" ? "Sí, voy" : "No puedo ir");
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nombre, kind, ts: Date.now() }));
  } catch (e) {}
}

if (btnYes) btnYes.addEventListener("click", () => handleRSVP("yes"));
if (btnNo) btnNo.addEventListener("click", () => handleRSVP("no"));

/* Si ya había confirmado antes en este mismo navegador, restaurar (sin confetti) */
window.addEventListener("DOMContentLoaded", () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.nombre && saved.kind) {
      rsvpName.value = saved.nombre;
      inviteCard.classList.remove("confirmed-yes", "confirmed-no");
      rsvpStatus.classList.remove("yes", "no");
      rsvpStatus.classList.add("show");
      if (saved.kind === "yes") {
        inviteCard.classList.add("confirmed-yes");
        rsvpStatus.classList.add("yes");
        rsvpStatus.textContent = `🎉 ¡Gracias, ${saved.nombre}! Te esperamos el 19/9, no te olvides de los colores tierra 🌾`;
      } else {
        inviteCard.classList.add("confirmed-no");
        rsvpStatus.classList.add("no");
        rsvpStatus.textContent = `Una pena que no puedas venir, ${saved.nombre} 😢 ¡Va a haber otra!`;
      }
    }
  } catch (e) {}
});
