// --- GLOBAL APPLICATION STATE ---
let appData = null;
let currentCourse = null;
let currentChapter = null;
let currentCardIndex = 0;

// --- DOM NODE CACHE ---
const courseView = document.getElementById("course-view");
const chapterView = document.getElementById("chapter-view");
const flashcardView = document.getElementById("flashcard-view");
const pageTitle = document.getElementById("page-title");
const breadcrumb = document.getElementById("breadcrumb");
const mainCard = document.getElementById("main-card");

// --- ASYNCHRONOUS INITIALIZATION ENGINE ---
async function initApp() {
  try {
    const response = await fetch("data.json");
    if (!response.ok)
      throw new Error("Failed to load flashcard configuration data.");
    appData = await response.json();
    goToHome();
  } catch (error) {
    console.error("Initialization Error:", error);
    pageTitle.innerText = "Error Loading App Data";
    courseView.innerHTML = `<p style="color: red; text-align: center; padding: 2rem;">Could not load data.json. Ensure you are running through a local web server.</p>`;
  }
}

// --- ROUTING / VIEW STATE CONTROLLERS ---
function setBreadcrumbs() {
  let html = `<span onclick="goToHome()">Dashboard</span>`;
  if (currentCourse) {
    html += `<span class="breadcrumb-separator">/</span><span onclick="goToCourse('${currentCourse.id}')">${currentCourse.title}</span>`;
  }
  if (currentChapter) {
    html += `<span class="breadcrumb-separator">/</span><span style="color: var(--text-primary); font-weight:700">${currentChapter.title}</span>`;
  }
  breadcrumb.innerHTML = html;
}

function goToHome() {
  currentCourse = null;
  currentChapter = null;

  pageTitle.innerText = "Study Tracks";
  setBreadcrumbs();

  chapterView.classList.remove("active");
  flashcardView.classList.remove("active-flex");
  courseView.classList.add("active");

  buildCourseGrid();
}

function goToCourse(courseId) {
  currentCourse = appData.courses.find((c) => c.id === courseId);
  currentChapter = null;

  pageTitle.innerText = currentCourse.title;
  setBreadcrumbs();

  courseView.classList.remove("active");
  flashcardView.classList.remove("active-flex");
  chapterView.classList.add("active");

  buildChapterGrid();
}

function goToChapter(chapterId) {
  currentChapter = currentCourse.chapters.find((ch) => ch.id === chapterId);
  currentCardIndex = 0;

  pageTitle.innerText = currentChapter.title;
  setBreadcrumbs();

  courseView.classList.remove("active");
  chapterView.classList.remove("active");
  flashcardView.classList.add("active-flex");

  loadActiveCard();
}

// --- VISUAL GRID RENDERING GENERATORS ---
function buildCourseGrid() {
  courseView.innerHTML = appData.courses
    .map(
      (course) => `
        <div class="block-card" onclick="goToCourse('${course.id}')">
            <div class="card-body">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
            </div>
            <div class="card-footer-action">Launch Track Modules &rarr;</div>
        </div>
    `,
    )
    .join("");
}

function buildChapterGrid() {
  chapterView.innerHTML = currentCourse.chapters
    .map(
      (chapter) => `
        <div class="block-card" onclick="goToChapter('${chapter.id}')">
            <div class="card-body">
                <h3>${chapter.title}</h3>
                <p>Deepen understanding through tailored flash assessment review blocks.</p>
            </div>
            <div class="card-footer-action">${chapter.cards.length} Core Flashcards &rarr;</div>
        </div>
    `,
    )
    .join("");
}

function loadActiveCard() {
  mainCard.classList.remove("flipped");
  const card = currentChapter.cards[currentCardIndex];

  setTimeout(() => {
    document.getElementById("card-front").innerText = card.front;
    document.getElementById("card-back").innerText = card.back;
  }, 120);

  document.getElementById("card-counter").innerText =
    `${currentCardIndex + 1} / ${currentChapter.cards.length}`;
  document.getElementById("prev-btn").disabled = currentCardIndex === 0;
  document.getElementById("next-btn").disabled =
    currentCardIndex === currentChapter.cards.length - 1;
}

// --- RUNTIME INTERACTION EMITTERS ---
function toggleFlip() {
  mainCard.classList.toggle("flipped");
}

function nextCard() {
  if (currentCardIndex < currentChapter.cards.length - 1) {
    currentCardIndex++;
    loadActiveCard();
  }
}

function previousCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    loadActiveCard();
  }
}

// Boot up runtime instance execution
initApp();
