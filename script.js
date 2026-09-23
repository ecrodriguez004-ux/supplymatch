/* ================= WHATSAPP DE SUPPLY MATCH ================= */
const WHATSAPP_NUMBER = "525532461015";

/* ================= VARIABLES ================= */
let messageTimer;
let activeModal = null;
let previousFocus = null;
let backgroundElements = [];
let currentSlide = 0;
let initialized = false;
const previousInertStates = new Map();

/* ================= AVISOS ================= */
function showMessage(message) {
  let element = document.getElementById("site-message");
  if (!element) {
    element = document.createElement("p");
    element.id = "site-message";
    element.className = "site-message";
    element.setAttribute("role", "status");
    document.body.appendChild(element);
  }
  element.textContent = message;
  element.hidden = false;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    element.hidden = true;
  }, 7000);
}

/* ================= ABRIR WHATSAPP ================= */
function openWhatsApp(message) {
  const text = message || "Hola, quiero información sobre Supply Match.";
  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ================= MENÚ MÓVIL ================= */
function setMenu(open) {
  const menu = document.getElementById("mobile-menu");
  const toggle = document.getElementById("menu-toggle");
  if (!menu || !toggle) return;
  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  toggle.textContent = open ? "×" : "☰";
}
function configureMenu() {
  const menu = document.getElementById("mobile-menu");
  const toggle = document.getElementById("menu-toggle");
  if (!menu || !toggle) return;
  setMenu(false);
  toggle.addEventListener("click", () => {
    setMenu(menu.hidden);
  });
  menu.querySelectorAll("a, button").forEach(element => {
    element.addEventListener("click", () => {
      setMenu(false);
    });
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenu(false);
  });
}

/* ================= ABRIR MODAL ================= */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal || activeModal) return;
  previousFocus = document.activeElement;
  activeModal = modal;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  backgroundElements.forEach(element => {
    previousInertStates.set(element, element.inert);
    element.inert = true;
  });
  const panel = modal.querySelector(".modal-panel");
  const closeButton = modal.querySelector(".modal-close");
  if (panel) panel.scrollTop = 0;
  if (closeButton) {
    closeButton.focus();
  } else if (panel) {
    panel.focus();
  }
}

/* ================= CERRAR MODAL ================= */
function closeModal(id) {
  if (!activeModal || activeModal.id !== id) return;
  activeModal.hidden = true;
  activeModal = null;
  document.body.classList.remove("modal-open");
  backgroundElements.forEach(element => {
    element.inert = previousInertStates.get(element) || false;
  });
  previousInertStates.clear();
  if (previousFocus && previousFocus.isConnected) {
    previousFocus.focus();
  }
}

/* ================= CONTROLES DE LOS MODALES ================= */
function configureModals() {
  backgroundElements = Array.from(
    document.querySelectorAll(
      "body > header, body > main, body > footer, #whatsapp-float"
    )
  );
  document.querySelectorAll(".modal").forEach(modal => {
    modal.hidden = true;
    const panel = modal.querySelector(".modal-panel");
    if (panel) panel.setAttribute("tabindex", "-1");
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal(modal.id);
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (activeModal) {
        closeModal(activeModal.id);
      } else {
        const menu = document.getElementById("mobile-menu");
        const toggle = document.getElementById("menu-toggle");
        if (menu && !menu.hidden) {
          setMenu(false);
          if (toggle) toggle.focus();
        }
      }
      return;
    }
    if (!activeModal || event.key !== "Tab") return;
    const focusableElements = Array.from(
      activeModal.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex="0"]'
      )
    ).filter(element => {
      return !element.disabled && element.getClientRects().length > 0;
    });
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (!firstElement) {
      event.preventDefault();
      const panel = activeModal.querySelector(".modal-panel");
      if (panel) panel.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
}

/* ================= MEMBRESÍAS DESPLEGABLES ================= */
function revealOffer() {
  const content = document.getElementById("offer-reveal");
  const button = document.getElementById("offer-button");
  if (!content || !button) return;
  const willOpen = content.hidden || content.classList.contains("hidden");
  content.hidden = !willOpen;
  content.classList.toggle("hidden", !willOpen);
  button.setAttribute("aria-expanded", String(willOpen));
  button.textContent = willOpen
    ? "Ocultar membresías"
    : "Conocer membresías";
}

/* ================= COPIAR NOMBRE ================= */
async function copyDiscount() {
  const code = document.querySelector(".offer-code");
  const feedback = document.getElementById("copy-feedback");
  if (!code) return;
  const text = code.textContent.trim();
  let message;
  try {
    await navigator.clipboard.writeText(text);
    message = `Texto copiado: ${text}`;
  } catch {
    message =
      `No se pudo copiar automáticamente. Selecciona y copia: ${text}`;
  }
  if (feedback) {
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.classList.remove("hidden");
  } else {
    showMessage(message);
  }
}

/* ================= CAMBIAR DIAPOSITIVA ================= */
function showSlide(index) {
  const track = document.getElementById("testimonial-track");
  const slides = Array.from(
    document.querySelectorAll(".testimonial-slide")
  );
  const dots = Array.from(
    document.querySelectorAll("#testimonial-dots button")
  );
  if (!track || slides.length === 0) return;
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  slides.forEach((slide, position) => {
    const isActive = position === currentSlide;
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.inert = !isActive;
  });
  dots.forEach((dot, position) => {
    const isActive = position === currentSlide;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-current", String(isActive));
  });
}

/* ================= CONTROLES DEL CARRUSEL ================= */
function configureCarousel() {
  const previousButton = document.getElementById("testimonial-prev");
  const nextButton = document.getElementById("testimonial-next");
  if (previousButton) {
    previousButton.addEventListener("click", () => {
      showSlide(currentSlide - 1);
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      showSlide(currentSlide + 1);
    });
  }
  document.querySelectorAll("#testimonial-dots button").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
    });
  });
  showSlide(0);
}

/* ================= IMAGEN DE RESPALDO ================= */
function createImagePlaceholder(isLogo) {
  const title = isLogo ? "Supply Match" : "Imagen pendiente";
  const subtitle = isLogo
    ? "Agrega tu archivo logo.png"
    : "Agrega la fotografía del proveedor";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="900" height="600" viewBox="0 0 900 600">
      <rect width="900" height="600" fill="#f0f8fa"/>
      <text x="450" y="285"
            text-anchor="middle"
            font-family="Georgia, serif"
            font-size="58"
            font-weight="bold"
            fill="#287e92">${title}</text>
      <text x="450" y="345"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="23"
            fill="#6c7e86">${subtitle}</text>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/* ================= CARGA DE IMÁGENES ================= */
function configureImages() {
  document.querySelectorAll("img").forEach(img => {
    function usePlaceholder() {
      if (img.dataset.fallback === "true") return;
      img.dataset.fallback = "true";
      const isLogo = Boolean(img.closest(".logo, .hero-image"));
      img.src = createImagePlaceholder(isLogo);
      img.alt = isLogo
        ? "Supply Match: logo pendiente"
        : "Fotografía del proveedor pendiente";
    }
    img.addEventListener("error", usePlaceholder);
    if (img.complete && img.naturalWidth === 0) {
      usePlaceholder();
    }
  });
}

/* ================= ANIMACIONES ================= */
function configureAnimations() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(element => {
    observer.observe(element);
  });
}

/* ================= INICIAR PÁGINA ================= */
function initializeSupplyMatch() {
  if (initialized) return;
  initialized = true;
  configureMenu();
  configureModals();
  configureCarousel();
  configureImages();
  configureAnimations();
  const offerButton = document.getElementById("offer-button");
  const offerContent = document.getElementById("offer-reveal");
  if (offerButton && offerContent) {
    const isOpen =
      !offerContent.hidden && !offerContent.classList.contains("hidden");
    offerButton.setAttribute("aria-expanded", String(isOpen));
    offerButton.setAttribute("aria-controls", "offer-reveal");
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ================= ESPERAR AL HTML ================= */
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeSupplyMatch,
    { once: true }
  );
} else {
  initializeSupplyMatch();
}
