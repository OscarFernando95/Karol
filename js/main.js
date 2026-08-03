document.getElementById('year').textContent = new Date().getFullYear();

/* menú móvil */
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const mainNav = document.querySelector('.main-nav');
const navBackdrop = document.querySelector('.nav-backdrop');

function openMenu() {
  mainNav.classList.add('is-open');
  navBackdrop.classList.add('is-open');
  menuToggle.classList.add('is-hidden');
  menuToggle.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  mainNav.classList.remove('is-open');
  navBackdrop.classList.remove('is-open');
  menuToggle.classList.remove('is-hidden');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
navBackdrop.addEventListener('click', closeMenu);
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

/* barra de progreso de scroll */
const progressLine = document.querySelector('.progress-line');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressLine.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* reveal on scroll */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* tracker del método: cada tarjeta se fija (sticky) y la siguiente la cubre
   al llegar; la "activa" es la última tarjeta cuyo borde superior ya alcanzó
   el punto de fijado, es decir, la que está por encima de las demás.
   Se mide la tarjeta `.step` directamente (no su carril `.step-pin`), porque
   una tarjeta puede quedar cubierta por la siguiente ya sea porque se fijó
   ahí o porque el margen negativo del carril la empujó a esa posición. */
const steps = document.querySelectorAll('.step');
const trackerItems = document.querySelectorAll('.method-tracker li');
const trackerFill = document.querySelector('.tracker-fill');

function updateActiveStep() {
  // lee el `top` sticky real (cambia entre breakpoints en style.css)
  // en vez de asumir un valor fijo
  const offset = parseFloat(getComputedStyle(steps[0]).top) || 0;
  let activeIdx = 0;
  steps.forEach((step, i) => {
    if (step.getBoundingClientRect().top <= offset + 1) activeIdx = i;
  });
  trackerItems.forEach(li => li.classList.toggle('active', Number(li.dataset.step) === activeIdx));
  // --progress alimenta el alto de la línea en escritorio (vertical) y el
  // ancho en móvil (horizontal) — cada breakpoint decide cuál usar en CSS
  trackerFill.style.setProperty('--progress', ((activeIdx + 1) / steps.length) * 100 + '%');
}
window.addEventListener('scroll', updateActiveStep, { passive: true });
updateActiveStep();

/* modal de cliente: se abre sin salir de la página al tocar un logo-slot.
   `media` es la galería (fotos/video) que se muestra dentro del modal. */
const CLIENTS = [
  {
    title: 'Weekend',
    eyebrow: 'Gastronomía',
    description: '',
    logo: 'media/Cliente1/logo.png',
    instagram: 'https://www.instagram.com/weekend_pitalito/',
    media: [
      { type: 'image', src: 'media/Cliente1/imagen1.png' }
    ]
  },
  {
    title: 'Diamond 4C Fit',
    eyebrow: 'Fitness',
    description: '',
    logo: 'media/Cliente2/logo.png',
    instagram: 'https://www.instagram.com/diamond4c_fit/',
    media: [
      { type: 'image', src: 'media/Cliente2/imagen1.png' },
      { type: 'image', src: 'media/Cliente2/imagen2.jpg' },
      { type: 'video', src: 'media/Cliente2/video1.mp4' },
      { type: 'video', src: 'media/Cliente2/video2.mp4' }
    ]
  },
  {
    title: 'Liqui Moly',
    eyebrow: 'Automotriz',
    description: '',
    logo: 'media/Cliente3/logo.png',
    instagram: 'https://www.instagram.com/liquimoly.colombia/?hl=es',
    media: [
      { type: 'video', src: 'media/Cliente3/imagen1.mp4' }
    ]
  },
  {
    title: 'Real Burguer',
    eyebrow: 'Gastronomía',
    description: '',
    logo: 'media/Cliente4/logo.png',
    instagram: 'https://www.instagram.com/_realburge12/',
    media: [
      { type: 'video', src: 'media/Cliente4/video1.mp4' }
    ]
  }
];

const clientModal = document.querySelector('.client-modal');
const clientModalLogo = document.querySelector('.client-modal-logo');
const clientModalInstagram = document.querySelector('.client-modal-instagram');
const clientModalMedia = document.querySelector('.client-modal-media');
const clientModalMediaTrack = document.querySelector('.client-modal-media-track');
const clientModalMediaDots = document.querySelector('.client-modal-media-dots');
const clientModalEyebrow = document.querySelector('.client-modal-eyebrow');
const clientModalTitle = document.querySelector('.client-modal-title');
const clientModalDesc = document.querySelector('.client-modal-desc');
const clientModalClose = document.querySelector('.client-modal-close');
let lastClientTrigger = null;

// reproduce automáticamente (silenciado, en loop) solo el video visible de la
// galería — así funciona igual en móvil (autoplay requiere muted) y escritorio
function playActiveSlide(index) {
  clientModalMediaTrack.querySelectorAll('.media-slide').forEach((slide, i) => {
    const video = slide.querySelector('video');
    if (!video) return;
    if (i === index) video.play().catch(() => {});
    else video.pause();
  });
}

function renderClientMedia(client) {
  clientModalMediaTrack.innerHTML = '';
  clientModalMediaDots.innerHTML = '';
  const items = client.media || [];

  items.forEach((item, i) => {
    const slide = document.createElement('div');
    slide.className = 'media-slide';
    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.preload = 'metadata';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', '');
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = client.title;
      slide.appendChild(img);
    }
    clientModalMediaTrack.appendChild(slide);
  });

  clientModalMedia.classList.toggle('has-gallery', items.length > 1);

  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver elemento ${i + 1} de ${items.length}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => {
      clientModalMediaTrack.scrollTo({ left: clientModalMediaTrack.clientWidth * i, behavior: 'smooth' });
    });
    clientModalMediaDots.appendChild(dot);
  });

  playActiveSlide(0);
}

clientModalMediaTrack.addEventListener('scroll', () => {
  const width = clientModalMediaTrack.clientWidth;
  if (!width) return;
  const activeIndex = Math.round(clientModalMediaTrack.scrollLeft / width);
  clientModalMediaDots.querySelectorAll('button').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === activeIndex);
  });
  playActiveSlide(activeIndex);
}, { passive: true });

function openClientModal(index, triggerEl) {
  const client = CLIENTS[index];
  if (!client) return;

  if (triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    clientModal.style.setProperty('--origin-x', `${((rect.left + rect.width / 2) / window.innerWidth) * 100}%`);
    clientModal.style.setProperty('--origin-y', `${((rect.top + rect.height / 2) / window.innerHeight) * 100}%`);
  }

  renderClientMedia(client);
  clientModalLogo.src = client.logo || '';
  clientModalLogo.alt = client.title;
  clientModalEyebrow.textContent = client.eyebrow;
  clientModalTitle.textContent = client.title;
  clientModalDesc.textContent = client.description;
  clientModalDesc.style.display = client.description ? '' : 'none';
  clientModalInstagram.setAttribute('aria-label', `Instagram de ${client.title}`);
  if (client.instagram) {
    clientModalInstagram.href = client.instagram;
    clientModalInstagram.hidden = false;
  } else {
    clientModalInstagram.removeAttribute('href');
    clientModalInstagram.hidden = true;
  }
  clientModal.classList.add('is-open');
  clientModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  clientModalClose.focus();
}
function closeClientModal() {
  clientModal.classList.remove('is-open');
  clientModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  clientModalMediaTrack.querySelectorAll('video').forEach(video => video.pause());
  if (lastClientTrigger) lastClientTrigger.focus();
}

document.querySelectorAll('.client-logo').forEach(btn => {
  btn.addEventListener('click', () => {
    lastClientTrigger = btn;
    openClientModal(Number(btn.dataset.client), btn);
  });
});
clientModalClose.addEventListener('click', closeClientModal);
document.querySelector('.client-modal-backdrop').addEventListener('click', closeClientModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && clientModal.classList.contains('is-open')) closeClientModal();
});

/* ===================== Kroma Motion ===================== */
/* EDITAR: pega aquí el link de cada publicación de Instagram que quieras
   mostrar (hasta 3) — ej. 'https://www.instagram.com/p/XXXXXXXXXXX/' — y la
   URL del perfil de Instagram de Kroma Motion. Deja un espacio en KROMA_POSTS
   como '' para mostrar un espacio reservado mientras tanto. */
const KROMA_POSTS = ['https://www.instagram.com/reel/DbJD8OGOPoH/?igsh=ZWQ4OGNtMjR3MTBn',
  'https://www.instagram.com/reel/DbERAtxvzEt/?igsh=MWM0M3ZheHZ5NmQyMQ==',
  'https://www.instagram.com/reel/Da-9lZdxmaM/?igsh=d3p2NWF1dzA4c3dn'];
const KROMA_INSTAGRAM_URL = 'https://www.instagram.com/kroma_motion/';

const kromaInstagramBtn = document.getElementById('kroma-instagram-btn');
if (KROMA_INSTAGRAM_URL) {
  kromaInstagramBtn.href = KROMA_INSTAGRAM_URL;
  kromaInstagramBtn.hidden = false;
}

const kromaFeed = document.getElementById('kroma-feed');
KROMA_POSTS.forEach(url => {
  const card = document.createElement('div');
  card.className = 'kroma-post';
  if (url) {
    const post = document.createElement('blockquote');
    post.className = 'instagram-media';
    post.setAttribute('data-instgrm-permalink', url);
    post.setAttribute('data-instgrm-version', '14');
    card.appendChild(post);
  } else {
    card.classList.add('kroma-post-placeholder');
    card.innerHTML = `
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5.5"/>
        <circle cx="12" cy="12" r="4.2"/>
        <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none"/>
      </svg>
      <span>Próxima publicación</span>
    `;
  }
  kromaFeed.appendChild(card);
});

// el embed oficial de Instagram solo se carga si hay al menos un link real,
// para no pedirle nada a instagram.com mientras KROMA_POSTS siga vacío
if (KROMA_POSTS.some(Boolean)) {
  const embedScript = document.createElement('script');
  embedScript.src = 'https://www.instagram.com/embed.js';
  embedScript.async = true;
  document.body.appendChild(embedScript);
}
