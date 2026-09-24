/* Project collections, native swipe carousels and an accessible lightbox.
 * No dependencies, autoplay timers or cloned slides. All photos stay in the catalog.
 */
(() => {
  'use strict';
  const language = document.documentElement.lang === 'es' ? 'es' : 'en';
  const es = language === 'es';
  const root = new URL('.', document.currentScript.src);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('.projects-lightbox');
  if (!dialog) return;
  const words = es ? {
    enlarge: 'Ampliar', unavailable: 'Fotografía no disponible', loading: 'Cargando fotografía…',
    previous: 'Fotos anteriores', next: 'Fotos siguientes', more: 'Más fotos de este proyecto',
    swipe: 'Desliza o usa las flechas para ver más fotos', carousel: 'carrusel',
    photo: 'foto', photos: 'fotos', project: 'proyecto', projects: 'proyectos', of: 'de'
  } : {
    enlarge: 'Enlarge', unavailable: 'Photograph unavailable', loading: 'Loading photograph…',
    previous: 'Previous photos', next: 'Next photos', more: 'More photos from this project',
    swipe: 'Swipe or use the arrows to see more photos', carousel: 'carousel',
    photo: 'photo', photos: 'photos', project: 'project', projects: 'projects', of: 'of'
  };
  const categories = ['air-conditioning', 'electrical'];
  const translated = value => value?.[language] || '';
  const bilingual = value => ['en', 'es'].every(key => typeof value?.[key] === 'string' && value[key].trim());
  const localPath = (src, category) => typeof src === 'string' &&
    new RegExp('^assets/projects/' + category + '/(?:[a-z0-9_-]+/)*[a-z0-9_-]+[.](jpe?g|png|webp|avif)$', 'i').test(src);
  const validSize = value => Number.isInteger(value) && value > 0;
  const warn = message => console.warn('[BM Projects] ' + message);
  const source = window.BM_PROJECTS?.projects;
  const projectIds = new Set();
  const projects = [];
  for (const item of Array.isArray(source) ? source : []) {
    if (!item || !categories.includes(item.category) || !/^[a-z0-9-]+$/.test(item.id || '') ||
        projectIds.has(item.id) || !bilingual(item.title) || !Array.isArray(item.images)) {
      warn('Skipped an invalid or duplicate project. Check the catalog guide.');
      continue;
    }
    const ids = new Set(), paths = new Set();
    const images = item.images.filter(photo => {
      const valid = photo && /^[a-z0-9-]+$/.test(photo.id || '') && !ids.has(photo.id) && !paths.has(photo.src) &&
        localPath(photo.src, item.category) && (!photo.full || localPath(photo.full, item.category)) &&
        bilingual(photo.alt) && validSize(photo.width) && validSize(photo.height);
      if (!valid) { warn('Skipped an invalid or duplicate photo in ' + item.id); return false; }
      ids.add(photo.id); paths.add(photo.src); return true;
    });
    if (!images.length) continue;
    projectIds.add(item.id);
    const cover = images.find(photo => photo.id === item.cover) || images[0];
    projects.push({...item, images, cover});
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  const photoCount = count => `${count} ${count === 1 ? words.photo : words.photos}`;
  const largeImage = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  let activeProject, activeIndex = 0, opener, swipeStart = null;
  let previousOverflow = '';

  function showPhoto(index) {
    activeIndex = (index + activeProject.images.length) % activeProject.images.length;
    const photo = activeProject.images[activeIndex];
    largeImage.hidden = true;
    largeImage.alt = translated(photo.alt);
    largeImage.width = photo.width;
    largeImage.height = photo.height;
    caption.textContent = words.loading;
    largeImage.src = new URL(photo.full || photo.src, root).href;
    dialog.querySelectorAll('[data-lightbox-direction]').forEach(button => {
      button.hidden = activeProject.images.length < 2;
    });
  }
  largeImage.addEventListener('load', () => {
    if (!dialog.open) return;
    largeImage.hidden = false;
    const photo = activeProject.images[activeIndex];
    caption.textContent = `${translated(activeProject.title)} — ${translated(photo.alt)} · ${activeIndex + 1} ${words.of} ${activeProject.images.length}`;
  });
  largeImage.addEventListener('error', () => {
    largeImage.hidden = true;
    caption.textContent = words.unavailable;
  });
  function openLightbox(project, photo, button) {
    activeProject = project;
    opener = button;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    showPhoto(project.images.indexOf(photo));
  }
  dialog.querySelector('.projects-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList.contains('projects-lightbox-content')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    largeImage.removeAttribute('src');
    opener?.focus({preventScroll:true});
  });
  dialog.querySelectorAll('[data-lightbox-direction]').forEach(button => {
    button.addEventListener('click', () => showPhoto(activeIndex + Number(button.dataset.lightboxDirection)));
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
    // The native dialog handles Escape, focus containment and background inertness.
  });
  const figure = dialog.querySelector('figure');
  figure.addEventListener('touchstart', event => {
    swipeStart = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
  }, {passive:true});
  figure.addEventListener('touchmove', event => {
    if (event.touches.length !== 1) swipeStart = null;
  }, {passive:true});
  figure.addEventListener('touchend', event => {
    if (!swipeStart || event.touches.length || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - swipeStart.x;
    const dy = event.changedTouches[0].clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(activeIndex + (dx < 0 ? 1 : -1));
  }, {passive:true});
  figure.addEventListener('touchcancel', () => { swipeStart = null; }, {passive:true});

  function photoButton(project, photo, className = '') {
    const button = element('button', 'projects-photo ' + className);
    button.type = 'button';
    button.dataset.photoId = photo.id;
    button.setAttribute('aria-label', `${words.enlarge}: ${translated(photo.alt)}`);
    const image = element('img');
    image.width = photo.width;
    image.height = photo.height;
    image.alt = translated(photo.alt);
    image.loading = 'lazy';
    image.decoding = 'async';
    // Catalog src is a web-sized image; full is fetched only on opening the lightbox.
    image.src = new URL(photo.src, root).href;
    const zoom = element('span', 'projects-zoom', '↗');
    zoom.setAttribute('aria-hidden', 'true');
    image.addEventListener('error', () => {
      image.hidden = true;
      zoom.hidden = true;
      button.disabled = true;
      button.setAttribute('aria-label', words.unavailable);
      button.append(element('span', 'projects-image-error', words.unavailable));
    }, {once:true});
    button.append(image, zoom);
    button.addEventListener('click', () => openLightbox(project, photo, button));
    return button;
  }

  function createCarousel(project, photos) {
    const gallery = element('div', 'projects-gallery');
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-roledescription', words.carousel);
    gallery.setAttribute('aria-label', translated(project.title));
    const heading = element('div', 'projects-gallery-heading');
    heading.append(element('h4', '', words.more));
    const controls = element('div', 'projects-controls');
    const track = element('div', 'projects-track');
    track.id = 'gallery-' + project.id;
    track.tabIndex = 0;
    track.setAttribute('aria-label', words.swipe);
    const previous = element('button', '', '←'), next = element('button', '', '→');
    [previous, next].forEach((button, index) => {
      button.type = 'button';
      button.setAttribute('aria-label', index ? words.next : words.previous);
      button.setAttribute('aria-controls', track.id);
      button.dataset.direction = index ? '1' : '-1';
      controls.append(button);
    });
    heading.append(controls);
    photos.forEach(photo => track.append(photoButton(project, photo)));
    gallery.append(heading, track, element('p', 'projects-swipe-hint', words.swipe));
    function updateControls() {
      const end = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= end - 2;
      controls.hidden = end <= 2;
      gallery.querySelector('.projects-swipe-hint').hidden = end <= 2;
    }
    function move(direction) {
      const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      track.scrollBy({left:direction * step, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    track.addEventListener('scroll', updateControls, {passive:true});
    new ResizeObserver(updateControls).observe(track);
    return gallery;
  }

  function projectCard(project) {
    const article = element('article', 'project-card');
    article.id = 'project-' + project.id;
    article.dataset.projectId = project.id;
    const heading = element('div', 'project-card-heading');
    const title = element('h3', '', translated(project.title));
    title.id = 'title-' + project.id;
    article.setAttribute('aria-labelledby', title.id);
    heading.append(title, element('span', 'projects-photo-count', photoCount(project.images.length)));
    article.append(heading);
    if (translated(project.description)) article.append(element('p', 'project-description', translated(project.description)));
    article.append(photoButton(project, project.cover, 'project-cover'));
    const remaining = project.images.filter(photo => photo !== project.cover);
    if (remaining.length) article.append(createCarousel(project, remaining));
    return article;
  }

  document.querySelectorAll('[data-project-category]').forEach(section => {
    const collection = projects.filter(project => project.category === section.dataset.projectCategory);
    if (!collection.length) return;
    section.querySelector('.projects-empty').hidden = true;
    const summary = section.querySelector('.projects-summary');
    summary.hidden = false;
    const count = collection.reduce((sum, project) => sum + project.images.length, 0);
    summary.textContent = `${collection.length} ${collection.length === 1 ? words.project : words.projects} · ${photoCount(count)}`;
    collection.forEach(project => section.querySelector('.projects-list').append(projectCard(project)));
  });

  // Featured is only a curated window. Every photo remains in its project collection.
  const explicit = projects.flatMap(project => project.images.filter(photo => photo.featured === true).map(photo => ({project, photo})));
  const covers = projects.map(project => ({project, photo:project.cover}));
  const all = projects.flatMap(project => project.images.map(photo => ({project, photo})));
  const candidates = explicit.length ? explicit : [...covers, ...all];
  const seen = new Set();
  const featured = candidates.filter(({photo}) => {
    if (seen.has(photo.src)) return false;
    seen.add(photo.src); return true;
  }).slice(0, 8);
  const featuredSection = document.querySelector('.projects-featured-section');
  if (featured.length) {
    featuredSection.hidden = false;
    featured.forEach(({project, photo}) => {
      const card = element('figure', 'projects-featured-card');
      card.append(photoButton(project, photo), element('figcaption', '', translated(project.title)));
      featuredSection.querySelector('.projects-featured').append(card);
    });
  }
})();
