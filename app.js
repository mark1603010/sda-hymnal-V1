const hymnList = document.getElementById('hymn-list');
const searchInput = document.getElementById('search');
const darkModeToggle = document.getElementById('darkModeToggle');

let hymns = [];
let currentFontSize = 1.7;

const CURRENT_VERSION = 'v1.0.5'; // Match your CACHE_NAME in sw.js


navigator.serviceWorker.addEventListener('message', event => {
  console.log('SW message received for version:', CURRENT_VERSION);
  if (event.data?.type === 'UPDATE_AVAILABLE') {
    showUpdatePrompt(); // your custom UI
  }
});


fetch('hymns.json')
  .then(res => res.json())
  .then(data => {
    hymns = data;
    renderHymns(hymns);

    if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('checkForUpdate'); //pag trigger ug message
}
  });

function renderHymns(hymnsToRender) {
  hymnList.innerHTML = '';
  hymnsToRender.forEach(hymn => {
    const card = document.createElement('div');
    card.className = 'hymn-card';
    card.innerHTML = `
      <h3>${hymn.number}. ${hymn.title}</h3>
      <p>${hymn.lyrics.slice(0, 100)}...</p>
    `;
    card.onclick = () => showFullHymn(hymn);
    hymnList.appendChild(card);
  });
}

// pag hatag color sa number per stanza
function formatLyrics(rawText) {
  const verses = rawText.split(/\n\n/); // Split by double line breaks
  return verses.map(verse => {
    const lines = verse.split('\n');
    const number = lines[0].trim();
    const body = lines.slice(1).join('<br>');
    return `<p><span class="verse-number">${number}</span><br>${body}</p>`;
  }).join('');
}

function showFullHymn(hymn) {
  hymnList.innerHTML = `
  <div class="hymn-split-view">
    <div class="hymn-lyrics">
      <div class="lyrics-header">
        <h2>${hymn.number}. ${hymn.title}</h2>
        <div class="font-controls">
          <button onclick="adjustFontSize(1)">A+</button>
          <button onclick="adjustFontSize(-1)">A−</button>
          <button id="toggleNotesBtn" onclick="toggleNotes(${hymn.number})">Show Musical Notes</button>
        </div>
        <div class="note-controls" id="noteControls" style="display: none;">
          <button onclick="zoomNote(1)">Zoom In</button>
          <button onclick="zoomNote(-1)">Zoom Out</button>
        </div>
      </div>

      <div id="hymnLyrics" class="lyrics-body">
        <div id="lyricsZoomWrapper"></div> <!-- ✅ Inject formatted lyrics here -->
      </div>

      <div class="lyrics-footer">
        <button class="back-button" onclick="goHome()">Home</button>
      </div>
    </div>

    <div class="hymn-notes" id="hymnNotes" style="display: none;">
      <div class="note-image-wrapper">
        <img id="noteImage" src="" alt="Hymn Notes" />
      </div>
    </div>
  </div>
`;

  // ✅ Now inject formatted lyrics separately
  document.getElementById('lyricsZoomWrapper').innerHTML = formatLyrics(hymn.lyrics);
}

function adjustFontSize(change) {
  currentFontSize += change * 0.1;
  currentFontSize = Math.max(1.3, Math.min(2.0, currentFontSize));
  const wrapper = document.getElementById('lyricsZoomWrapper');
  if (wrapper) {
    wrapper.style.fontSize = `${currentFontSize}rem`;
  }
}

function goHome() {
  renderHymns(hymns);
}

function goAbout() {
  hymnList.innerHTML = `
    <div class="hymn-card about-card">
      <img src="images/my_photo/roleen.JPG" alt="Your Photo" class="about-photo" />
      <h2>About This App</h2>
      <p>This SDA Hymnal web app was thoughtfully created with the sincere hope of making hymns more accessible for worship and personal devotion. This aimed to offer a gentle yet effective tool that helps users easily find and engage with beloved hymns anytime and anywhere. While it is a modest effort, the app includes features such as dynamic search to quickly locate hymns, a responsive design to ensure a smooth experience across devices, and scalable data integration to accommodate future growth and enhancements.</p>

      <p>The goal has always been to serve God with a simple, meaningful resource that supports faith and inspiration, and I am grateful for the opportunity to contribute in this small but heartfelt way.</p>
      <p>Created by <strong>Mark Roleen Banzon</strong>, Life without God can often feel like a journey without direction, filled with uncertainty and longing. Yet, life with God brings a boundless, enduring hope, one that sustains and uplifts even in the darkest moments. This hope is not merely fleeting but a steady light that gently guides and comforts the soul.</p>
      
      <div class="contact-links">
          <a href="mailto:mrs.creator@gmail.com">
            <i class="fas fa-envelope"></i>banzonroleen@gmail.com
          </a><br>
          <a href="https://www.facebook.com/roleen.banzon" target="_blank">
            <i class="fab fa-facebook"></i> Facebook Profile
          </a>
      </div><br>
      <button class="back-button" onclick="goHome()">Home</button>
    </div>
  `;
}


function showUpdatePrompt() {
  const dismissedVersion = localStorage.getItem('dismissedVersion');
  if (dismissedVersion === CURRENT_VERSION) return; // Don't show again

  const banner = document.createElement('div');
  banner.textContent = 'New hymns available! Click to refresh.';
  banner.className = 'update-banner';

  banner.onclick = () => {
    localStorage.setItem('dismissedVersion', CURRENT_VERSION); // ✅ Remember dismissal
    banner.remove();


    navigator.serviceWorker.addEventListener('controllerchange', () => {
      location.reload();
    });


    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  document.body.appendChild(banner);
}
 
searchInput.addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  const filtered = hymns.filter(hymn =>
    hymn.title.toLowerCase().includes(query) ||
    hymn.number.toString().includes(query)
  );
  renderHymns(filtered);
});

darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});




let lyricsZoomLevel = 1;

function zoomLyrics(delta) {
  lyricsZoomLevel = Math.max(0.5, Math.min(2, lyricsZoomLevel + delta * 0.1));
  const wrapper = document.getElementById('lyricsZoomWrapper');
  if (wrapper) {
    wrapper.style.transform = `scale(${lyricsZoomLevel})`;
    wrapper.style.transformOrigin = 'top center';
  }
}

//moa ni ang script para mo display ang musical note
function toggleNotes(hymnNumber) {
  const notesSection = document.getElementById('hymnNotes');
  const noteImage = document.getElementById('noteImage');
  const toggleBtn = document.getElementById('toggleNotesBtn');
  const zoomControls = document.getElementById('noteControls');

  if (notesSection.style.display === 'none' || notesSection.style.display === '') {
    const preload = new Image();
    preload.src = `images/notes/${hymnNumber}.png`;
    preload.onload = () => {
      noteImage.src = preload.src;
      notesSection.style.display = 'block';
      toggleBtn.textContent = 'Hide Notes';
      zoomControls.style.display = 'block'; // ✅ Show zoom buttons
      currentNoteScale = 1; // Reset scale
      applyNoteTransform();
    };
  } else {
    notesSection.style.display = 'none';
    toggleBtn.textContent = 'Show Notes';
    zoomControls.style.display = 'none'; // ✅ Hide zoom buttons
  }
}

//zoom logic function
let currentNoteScale = 1;

function zoomNote(direction) {
  if (direction === 1) {
    currentNoteScale = Math.min(currentNoteScale + 0.1, 2.0);
  } else if (direction === -1 && currentNoteScale > 1.0) {
    currentNoteScale = Math.max(currentNoteScale - 0.1, 1.0);
  }
  applyNoteTransform();
}

function applyNoteTransform() {
  const noteImage = document.getElementById('noteImage');
  if (noteImage) {
    noteImage.style.transform = `scale(${currentNoteScale})`;
    noteImage.style.transformOrigin = 'center';
  }

  if (currentNoteScale > 1) {
  enableNoteDrag();
} else {
  disableNoteDrag();
}
}

//para sa dragging
let offsetX = 0, offsetY = 0;
let isDragging = false;
let startX = 0, startY = 0;

function enableNoteDrag() {
  const noteImage = document.getElementById('noteImage');
  const container = document.getElementById('hymnNotes');

  noteImage.onmousedown = (e) => {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    noteImage.style.cursor = 'grabbing';
    e.preventDefault();
  };

  document.onmousemove = (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    const imageRect = noteImage.getBoundingClientRect();

    let newOffsetX = e.clientX - startX;
    let newOffsetY = e.clientY - startY;

    // Clamp horizontal movement
    const maxX = (imageRect.width * currentNoteScale - containerRect.width) / 2;
    newOffsetX = Math.max(-maxX, Math.min(maxX, newOffsetX));

    // Clamp vertical movement
    const maxY = (imageRect.height * currentNoteScale - containerRect.height) / 2;
    newOffsetY = Math.max(-maxY, Math.min(maxY, newOffsetY));

    offsetX = newOffsetX;
    offsetY = newOffsetY;

    noteImage.style.transform = `scale(${currentNoteScale}) translate(${offsetX}px, ${offsetY}px)`;
  };

  document.onmouseup = () => {
    isDragging = false;
    noteImage.style.cursor = 'grab';
  };
}

//para gihapon sa dragging
function disableNoteDrag() {
  const noteImage = document.getElementById('noteImage');
  noteImage.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
  noteImage.style.cursor = 'default';

  offsetX = 0;
  offsetY = 0;
  noteImage.style.transform = `scale(${currentNoteScale}) translate(0px, 0px)`;
}


//kung gusto e zoom gamay ang notes
function enableNoteZoom() {
  const noteImage = document.getElementById('noteImage');
  if (!noteImage) return;

  // Zoom in slightly
  noteImage.style.transform = 'scale(1.2)';
  noteImage.style.transformOrigin = 'center';

  // Enable drag
  let isDragging = false;
  let startX = 0, startY = 0;

  noteImage.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - parseInt(noteImage.style.left || 0);
    startY = e.clientY - parseInt(noteImage.style.top || 0);
    noteImage.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newLeft = e.clientX - startX;
    const newTop = e.clientY - startY;
    noteImage.style.left = `${newLeft}px`;
    noteImage.style.top = `${newTop}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    noteImage.style.cursor = 'grab';
  });

  // Prevent zoom out unless zoom is active
  noteImage.dataset.zoomEnabled = 'true';
}

