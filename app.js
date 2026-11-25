(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const liveStatus = document.getElementById('live-status');

  function announce(message) {
    if (!liveStatus) return;
    liveStatus.textContent = '';
    requestAnimationFrame(() => {
      liveStatus.textContent = message;
    });
  }

  /* ----------------------------------------------------------------
     1. Scroll-driven header fallback when CSS scroll() is unsupported
     ---------------------------------------------------------------- */
  if (!CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
    const header = document.getElementById('site-header');
    const onScroll = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------
     2. 3D Gyroscope-Style Tilt & Click-to-Flip for Hero & Studio Cards
     ---------------------------------------------------------------- */
  function attach3DTilt(card) {
    if (!card) return;

    card.addEventListener('pointermove', (e) => {
      if (prefersReducedMotion.matches || e.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 18;
      const rx = (0.5 - py) * 16;
      card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      card.style.setProperty('--sheen-x', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--sheen-y', `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--sheen-x', '50%');
      card.style.setProperty('--sheen-y', '30%');
    });
  }

  document.querySelectorAll('[data-hero-card]').forEach((card) => {
    attach3DTilt(card);
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
      announce(flipped ? 'Showing handwritten back note' : 'Showing front Polaroid photo');
    });
  });

  /* ----------------------------------------------------------------
     3. Interactive 3D Polaroid Studio (9 Frames, 5 Filters, Live Notes)
     ---------------------------------------------------------------- */
  const FRAME_TAGLINES = {
    'classic-white': 'Iconic glossy 600 ivory stock',
    'melon-soda': 'Fizzy Japanese cream soda with cherry and bubbles',
    'peach-paws': 'Creamy peach stock with tiny pink paw prints',
    'berry-gingham': 'Pastel strawberry picnic check and tiny hearts',
    'dreamy-stars': 'Cotton-candy lilac and mint with golden sparkles',
    'pastel-blush': 'Soft duochrome rose cardstock',
    'vintage-cream': 'Aged 1970s SX-70 archival parchment',
    'obsidian-black': 'Matte carbon gallery edition',
    'metallic-gold': 'Brushed champagne gold foil'
  };

  const STUDIO_PHOTOS = {
    campfire: {
      src: 'assets/photo-campfire.jpg',
      alt: 'Cozy twilight campfire glowing amber under tall Big Sur redwood trees',
      caption: 'Twilight around the Fire',
      date: 'August 22, 2024',
      location: 'Big Sur, CA',
      note: 'Woodsmoke in our sweaters, acoustic guitar chords bouncing through the redwoods. Hot tea and ghost stories under a canopy of stars.'
    },
    venice: {
      src: 'assets/photo-venice.jpg',
      alt: 'Golden-hour Venice Beach boardwalk with palm silhouettes against a peach sunset',
      caption: 'Venice Beach Boardwalk',
      date: 'July 18, 2024',
      location: 'Venice Beach, CA',
      note: 'Warm salt air and roller skates. We stayed until the sun dipped into the Pacific.'
    },
    cafe: {
      src: 'assets/photo-cafe.jpg',
      alt: 'Fizzy emerald-green Japanese melon cream soda with ice cream and a cherry',
      caption: 'Afternoon Melon Soda',
      date: 'May 11, 2025',
      location: 'Shimokitazawa, Tokyo',
      note: 'Quiet second-floor kissaten playing vinyl jazz while ice cream melted into fizzy emerald foam.'
    },
    tokyo: {
      src: 'assets/photo-tokyo.jpg',
      alt: 'Rainy twilight alleyway in Shinjuku with glowing magenta and cyan lantern reflections',
      caption: 'Shinjuku Rain Alley',
      date: 'April 4, 2024',
      location: 'Shinjuku, Tokyo',
      note: 'Steaming ramen broth after getting caught in a sudden downpour. Cherry blossoms and neon reflections in every puddle.'
    }
  };

  const studioCard = document.getElementById('studio-card');
  const studioFlipBtn = document.getElementById('studio-flip-btn');
  const studioPhotoImg = document.getElementById('studio-photo-img');
  const studioCaptionPreview = document.getElementById('studio-caption-preview');
  const studioMetaPreview = document.getElementById('studio-meta-preview');
  const studioBackDate = document.getElementById('studio-back-date');
  const studioBackLocation = document.getElementById('studio-back-location');
  const studioNotePreview = document.getElementById('studio-note-preview');
  const frameTagline = document.getElementById('frame-tagline');
  const captionInput = document.getElementById('caption-input');
  const noteInput = document.getElementById('note-input');

  attach3DTilt(studioCard);

  function toggleStudioFlip() {
    if (!studioCard) return;
    const flipped = studioCard.classList.toggle('is-flipped');
    studioCard.setAttribute('aria-pressed', String(flipped));
    if (studioFlipBtn) {
      studioFlipBtn.textContent = flipped ? 'Flip to front photo' : 'Flip card in 3D';
    }
    announce(flipped ? 'Flipped Polaroid to handwritten back note' : 'Flipped Polaroid to front photo');
  }

  studioCard?.addEventListener('click', toggleStudioFlip);
  studioFlipBtn?.addEventListener('click', toggleStudioFlip);

  document.querySelectorAll('input[name="frame-style"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const style = e.target.value;
      if (!studioCard) return;
      Object.keys(FRAME_TAGLINES).forEach((k) => studioCard.classList.remove(`frame-${k}`));
      studioCard.classList.add(`frame-${style}`);
      if (frameTagline) frameTagline.textContent = FRAME_TAGLINES[style] || '';
      announce(`Applied ${style.replace('-', ' ')} frame`);
    });
  });

  document.querySelectorAll('input[name="film-filter"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const filter = e.target.value;
      if (!studioPhotoImg) return;
      studioPhotoImg.className = `filter-${filter}`;
      announce(`Applied ${filter.replace('-', ' ')} film filter`);
    });
  });

  document.querySelectorAll('input[name="studio-photo"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const data = STUDIO_PHOTOS[e.target.value];
      if (!data || !studioPhotoImg) return;
      studioPhotoImg.src = data.src;
      studioPhotoImg.alt = data.alt;
      if (studioCaptionPreview) studioCaptionPreview.textContent = data.caption;
      if (studioMetaPreview) studioMetaPreview.textContent = `${data.date} • ${data.location}`;
      if (studioBackDate) studioBackDate.textContent = data.date;
      if (studioBackLocation) studioBackLocation.textContent = data.location;
      if (studioNotePreview) studioNotePreview.textContent = data.note;
      if (captionInput) captionInput.value = data.caption;
      if (noteInput) noteInput.value = data.note;
    });
  });

  captionInput?.addEventListener('input', (e) => {
    if (studioCaptionPreview) {
      studioCaptionPreview.textContent = e.target.value.trim() || 'Untitled Moment';
    }
  });

  noteInput?.addEventListener('input', (e) => {
    if (studioNotePreview) {
      studioNotePreview.textContent = e.target.value.trim() || 'No handwritten note on the back yet.';
    }
  });

  /* ----------------------------------------------------------------
     4. Interactive Landscape Album Book (Spreads, 8 Papers, Stickers)
     ---------------------------------------------------------------- */
  const BOOK_SPREADS = [
    {
      pages: [1, 2],
      left: [
        { img: 'assets/photo-cafe.jpg', caption: 'Melon Soda', tint: 'tint-melon', tilt: '-2.5deg', alt: 'Melon cream soda on wooden table' },
        { img: 'assets/photo-venice.jpg', caption: 'Venice Sunset', tint: 'tint-peach', tilt: '2deg', alt: 'Venice Beach palm trees at sunset' }
      ],
      right: [
        { img: 'assets/photo-tokyo.jpg', caption: 'Shinjuku Rain', tint: 'tint-obsidian', tilt: '-1.5deg', alt: 'Rainy neon alleyway in Shinjuku' },
        { img: 'assets/photo-campfire.jpg', caption: 'Big Sur Fire', tint: 'tint-gold', tilt: '2.5deg', alt: 'Campfire under redwoods' }
      ]
    },
    {
      pages: [3, 4],
      left: [
        { img: 'assets/photo-campfire.jpg', caption: 'Redwood Dusk', tint: 'tint-berry', tilt: '1.8deg', alt: 'Twilight campfire in forest' },
        { img: 'assets/photo-tokyo.jpg', caption: 'Midnight Lanterns', tint: 'tint-obsidian', tilt: '-2.2deg', alt: 'Tokyo rain reflections at night' }
      ],
      right: [
        { img: 'assets/photo-venice.jpg', caption: 'Pacific Breeze', tint: '', tilt: '-1.8deg', alt: 'Pacific sunset boardwalk' },
        { img: 'assets/photo-cafe.jpg', caption: 'Kissaten Break', tint: 'tint-melon', tilt: '2.4deg', alt: 'Green cream soda in sunlit cafe' }
      ]
    }
  ];

  let currentSpread = 0;
  const bookFrame = document.getElementById('album-book-frame');
  const leftSlots = document.getElementById('left-page-slots');
  const rightSlots = document.getElementById('right-page-slots');
  const leftPageNum = document.getElementById('left-page-num');
  const rightPageNum = document.getElementById('right-page-num');
  const bookSpreadLabel = document.getElementById('book-spread-label');
  const prevSpreadBtn = document.getElementById('prev-spread-btn');
  const nextSpreadBtn = document.getElementById('next-spread-btn');
  const leftPageEl = document.getElementById('book-page-left');
  const rightPageEl = document.getElementById('book-page-right');

  function renderPocketHTML(items) {
    return items.map((item) => `
      <div class="book-mini-polaroid ${item.tint}" style="--tilt: ${item.tilt}">
        <img src="${item.img}" alt="${item.alt}" width="180" height="180" loading="lazy">
        <span class="book-mini-caption">${item.caption}</span>
      </div>
    `).join('');
  }

  function renderSpread(animate) {
    const spread = BOOK_SPREADS[currentSpread];
    if (!spread || !leftSlots || !rightSlots) return;

    leftSlots.innerHTML = renderPocketHTML(spread.left);
    rightSlots.innerHTML = renderPocketHTML(spread.right);
    if (leftPageNum) leftPageNum.textContent = String(spread.pages[0]).padStart(2, '0');
    if (rightPageNum) rightPageNum.textContent = String(spread.pages[1]).padStart(2, '0');
    if (bookSpreadLabel) {
      bookSpreadLabel.textContent = `Pages ${spread.pages[0]} to ${spread.pages[1]} of ${BOOK_SPREADS.length * 2}`;
    }
    if (prevSpreadBtn) prevSpreadBtn.disabled = currentSpread === 0;
    if (nextSpreadBtn) nextSpreadBtn.disabled = currentSpread === BOOK_SPREADS.length - 1;

    if (animate && !prefersReducedMotion.matches) {
      [leftPageEl, rightPageEl].forEach((p) => {
        if (!p) return;
        p.classList.remove('is-turning');
        void p.offsetWidth;
        p.classList.add('is-turning');
      });
    }
  }

  renderSpread(false);

  prevSpreadBtn?.addEventListener('click', () => {
    if (currentSpread > 0) {
      currentSpread -= 1;
      renderSpread(true);
      announce(`Opened pages ${BOOK_SPREADS[currentSpread].pages[0]} and ${BOOK_SPREADS[currentSpread].pages[1]}`);
    }
  });

  nextSpreadBtn?.addEventListener('click', () => {
    if (currentSpread < BOOK_SPREADS.length - 1) {
      currentSpread += 1;
      renderSpread(true);
      announce(`Opened pages ${BOOK_SPREADS[currentSpread].pages[0]} and ${BOOK_SPREADS[currentSpread].pages[1]}`);
    }
  });

  // Switch 8 book paper themes
  document.querySelectorAll('input[name="book-theme"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (!bookFrame) return;
      bookFrame.className = `album-book-frame theme-${e.target.value}`;
      announce(`Switched album paper to ${e.target.value.replace('-', ' ')}`);
    });
  });

  // Accessible Tabs for Book Design Studio (Page Paper / Stickers)
  const tabButtons = Array.from(document.querySelectorAll('.studio-tabs [role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll('.studio-tabs [role="tabpanel"]'));

  function selectTab(targetTab) {
    tabButtons.forEach((tab) => {
      const selected = tab === targetTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    tabPanels.forEach((panel) => {
      const match = panel.getAttribute('aria-labelledby') === targetTab.id;
      if (match) {
        panel.removeAttribute('hidden');
      } else {
        panel.hidden = 'until-found';
      }
    });
  }

  tabButtons.forEach((tab, idx) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabButtons.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = tabButtons.length - 1;
      else return;
      e.preventDefault();
      tabButtons[nextIdx].focus();
      selectTab(tabButtons[nextIdx]);
    });
  });

  tabPanels.forEach((panel) => {
    panel.addEventListener('beforematch', () => {
      const owner = document.getElementById(panel.getAttribute('aria-labelledby'));
      if (owner) selectTab(owner);
    });
  });

  // Die-cut SVG stickers placed & draggable on the right book page
  const STICKER_SVGS = {
    paw: '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#FFF" stroke="#F2AE95" stroke-width="2.5"/><ellipse cx="24" cy="29" rx="9" ry="7.5" fill="#FF9EB0"/><circle cx="15" cy="19" r="3.6" fill="#FF9EB0"/><circle cx="21" cy="15" r="3.6" fill="#FF9EB0"/><circle cx="27" cy="15" r="3.6" fill="#FF9EB0"/><circle cx="33" cy="19" r="3.6" fill="#FF9EB0"/></svg>',
    strawberry: '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#FFF" stroke="#F1A1B9" stroke-width="2.5"/><path d="M24 38 C14 34 12 22 17 17 C20 14 28 14 31 17 C36 22 34 34 24 38Z" fill="#FF6B8B"/><path d="M18 15 L24 19 L30 15 L26 11 L24 14 L22 11Z" fill="#63C784"/><circle cx="20" cy="24" r="1.4" fill="#FFE59D"/><circle cx="28" cy="24" r="1.4" fill="#FFE59D"/><circle cx="24" cy="30" r="1.4" fill="#FFE59D"/></svg>',
    sparkles: '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><path d="M24 4 L28 19 L43 23 L28 27 L24 42 L20 27 L5 23 L20 19 Z" fill="#FFE082" stroke="#FFF" stroke-width="3" stroke-linejoin="round"/></svg>',
    bow: '<svg viewBox="0 0 48 48" width="46" height="46" aria-hidden="true"><path d="M24 24 C16 14 7 15 8 24 C9 33 17 31 24 24 Z" fill="#FFB7C5" stroke="#FFF" stroke-width="2.5"/><path d="M24 24 C32 14 41 15 40 24 C39 33 31 31 24 24 Z" fill="#FFB7C5" stroke="#FFF" stroke-width="2.5"/><circle cx="24" cy="24" r="4.5" fill="#FF6B8B" stroke="#FFF" stroke-width="2"/></svg>',
    sakura: '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><g fill="#FFC4D4" stroke="#FFF" stroke-width="2"><circle cx="24" cy="14" r="7"/><circle cx="33" cy="21" r="7"/><circle cx="30" cy="32" r="7"/><circle cx="18" cy="32" r="7"/><circle cx="15" cy="21" r="7"/></g><circle cx="24" cy="24" r="4.5" fill="#FFE082"/></svg>',
    heart: '<svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true"><path d="M24 39 C11 30 7 22 10 15 C13 9 20 10 24 16 C28 10 35 9 38 15 C41 22 37 30 24 39 Z" fill="#FF6B8B" stroke="#FFF" stroke-width="3"/></svg>',
    melon: '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect x="13" y="16" width="22" height="24" rx="5" fill="#88E7A6" stroke="#FFF" stroke-width="3"/><circle cx="24" cy="16" r="7" fill="#FFFDF5"/><circle cx="28" cy="11" r="4" fill="#EB425E"/></svg>',
    washi: '<svg viewBox="0 0 72 28" width="66" height="26" aria-hidden="true"><rect x="2" y="4" width="68" height="20" rx="2" fill="rgba(255, 183, 197, 0.85)" stroke="#FFF" stroke-width="2" stroke-dasharray="6 4"/></svg>'
  };

  const stickerLayer = document.getElementById('book-sticker-layer');
  const clearStickersBtn = document.getElementById('clear-stickers-btn');

  function addSticker(type, xPct, yPct, rotDeg) {
    if (!stickerLayer || !STICKER_SVGS[type]) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'placed-sticker';
    btn.setAttribute('aria-label', `${type} sticker, drag to move`);
    btn.style.left = `${xPct}%`;
    btn.style.top = `${yPct}%`;
    btn.style.setProperty('--rot', `${rotDeg}deg`);
    btn.innerHTML = STICKER_SVGS[type];

    let dragging = false;
    btn.addEventListener('pointerdown', (e) => {
      dragging = true;
      btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const rect = stickerLayer.getBoundingClientRect();
      const nx = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
      const ny = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
      btn.style.left = `${nx.toFixed(1)}%`;
      btn.style.top = `${ny.toFixed(1)}%`;
    });
    btn.addEventListener('pointerup', () => { dragging = false; });
    btn.addEventListener('pointercancel', () => { dragging = false; });

    stickerLayer.appendChild(btn);
  }

  // Seed two charming starter stickers on the open spread
  addSticker('washi', 28, 12, -6);
  addSticker('sparkles', 84, 18, 12);

  document.querySelectorAll('[data-sticker]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sticker');
      const rx = 20 + Math.random() * 60;
      const ry = 18 + Math.random() * 62;
      const rot = Math.round((Math.random() - 0.5) * 24);
      addSticker(type, rx, ry, rot);
      announce(`Added ${type} sticker to album page`);
    });
  });

  clearStickersBtn?.addEventListener('click', () => {
    if (stickerLayer) stickerLayer.innerHTML = '';
    announce('Cleared all stickers from page');
  });

  /* ----------------------------------------------------------------
     5. Interactive 4-Corner Perspective Rectification Demo
     ---------------------------------------------------------------- */
  const rectifySlider = document.getElementById('rectify-slider');
  const rectifyPercent = document.getElementById('rectify-percent');
  const autoRectifyBtn = document.getElementById('auto-rectify-btn');
  const deskSurface = document.querySelector('.desk-surface');

  function setRectify(val) {
    const clamped = Math.max(0, Math.min(100, Number(val)));
    if (rectifySlider) rectifySlider.value = String(clamped);
    if (rectifyPercent) rectifyPercent.textContent = `${clamped}%`;
    if (deskSurface) deskSurface.style.setProperty('--rectify', String(clamped / 100));
    if (autoRectifyBtn) {
      autoRectifyBtn.textContent = clamped >= 100 ? 'Reset tilted scan' : 'Rectify print now';
    }
  }

  rectifySlider?.addEventListener('input', (e) => setRectify(e.target.value));

  autoRectifyBtn?.addEventListener('click', () => {
    const current = Number(rectifySlider?.value || 0);
    const target = current >= 100 ? 0 : 100;
    setRectify(target);
    announce(target === 100 ? 'Print rectified to flat archival alignment' : 'Reset to tilted desk scan');
  });

  /* ----------------------------------------------------------------
     6. Real Android Screenshot Gallery (4 Screens x Light / Dark)
     ---------------------------------------------------------------- */
  const APP_SCREENSHOTS = {
    home: {
      orientation: 'portrait',
      light: {
        src: 'assets/screen-home-light.jpg',
        alt: 'Cheki Book Android Home Vault in Light mode showing Peach Paws banner, search bar, Flip All 3D button, Albums shelf, and Polaroid grid',
        caption: 'Home Vault in light mode: Peach Paws banner, Flip All 3D, album shelves, and instant search.'
      },
      dark: {
        src: 'assets/screen-home-dark.jpg',
        alt: 'Cheki Book Android Home Vault in Dark mode with warm cocoa-plum surfaces, Albums shelf, and Polaroid grid',
        caption: 'Home Vault in dark mode: cozy cocoa-plum surfaces with glowing coral highlights and Polaroid frames.'
      }
    },
    detail: {
      orientation: 'portrait',
      light: {
        src: 'assets/screen-detail-light.jpg',
        alt: 'Cheki Book Polaroid Detail in Light mode showing Maple Gold Afternoon in the Melon Soda frame with 3D flip button and frame swatches',
        caption: 'Frame Picker in light mode: switch between 9 tactile frames, flip to the 3D back note, and assign multiple albums.'
      },
      dark: {
        src: 'assets/screen-detail-dark.jpg',
        alt: 'Cheki Book Polaroid Detail in Dark mode showing Maple Gold Afternoon in the Melon Soda frame with frame swatches and album chips',
        caption: 'Frame Picker in dark mode: live Melon Soda frame preview with bubbles, cherry detail, and instant album tagging.'
      }
    },
    cover: {
      orientation: 'landscape',
      light: {
        src: 'assets/screen-cover-light.jpg',
        alt: 'Cheki Book Landscape Album Book Cover in Light mode showing All Memories rose-peach cover with Shinjuku Rain Alley Polaroid',
        caption: 'Landscape Album Cover in light mode: tap or swipe the rose-peach cover to open, or swap the featured cover Polaroid.'
      },
      dark: {
        src: 'assets/screen-cover-dark.jpg',
        alt: 'Cheki Book Landscape Album Book Cover in Dark mode with starry background and rose-peach cover',
        caption: 'Landscape Album Cover in dark mode: rose-peach physical book cover set against a starry cocoa-plum canvas.'
      }
    },
    spread: {
      orientation: 'landscape',
      light: {
        src: 'assets/screen-spread-gingham-light.jpg',
        alt: 'Cheki Book open two-page ring-bound Album Book spread in Light mode with Peach Gingham cardstock paper and four framed Polaroids',
        caption: 'Open Album Book Spread in light mode: ring-bound two-page layout on Peach Gingham cardstock with individual 3D flip buttons.'
      },
      dark: {
        src: 'assets/screen-spread-gingham-dark.jpg',
        alt: 'Cheki Book open two-page ring-bound Album Book spread in Dark mode with Peach Gingham cardstock paper and four framed Polaroids',
        caption: 'Open Album Book Spread in dark mode: ring-bound pages stay bright and tactile while the surrounding stage dims.'
      }
    }
  };

  let activeScreen = 'home';
  let activeTheme = 'light';
  const galleryFrame = document.getElementById('gallery-device-frame');
  const galleryImg = document.getElementById('gallery-active-img');
  const galleryCaption = document.getElementById('gallery-active-caption');

  function updateAppGallery() {
    const entry = APP_SCREENSHOTS[activeScreen];
    if (!entry || !galleryFrame || !galleryImg) return;
    const variant = entry[activeTheme];
    galleryFrame.classList.toggle('is-portrait', entry.orientation === 'portrait');
    galleryFrame.classList.toggle('is-landscape', entry.orientation === 'landscape');
    galleryImg.src = variant.src;
    galleryImg.alt = variant.alt;
    if (galleryCaption) galleryCaption.textContent = variant.caption;
    announce(`Showing ${activeScreen} screenshot in ${activeTheme} mode`);
  }

  document.querySelectorAll('input[name="app-screen"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      activeScreen = e.target.value;
      updateAppGallery();
    });
  });

  document.querySelectorAll('input[name="app-theme"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      activeTheme = e.target.value;
      updateAppGallery();
    });
  });
})();
