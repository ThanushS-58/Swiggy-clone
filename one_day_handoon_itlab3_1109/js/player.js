/**
 * SkillForge Pro - Interactive Course Player
 * Powers the dual-mode course viewer (Executive Summary vs. Deep Dive),
 * in-lesson scratchpad notes, scenario quiz checks, and progress tracking.
 */

const SkillForgePlayer = {
  currentCourse: null,
  currentLesson: null,
  activeMode: "summary", // 'summary' | 'deepdive'

  init() {
    this.loadCourseAndLesson();
    this.bindEvents();
  },

  loadCourseAndLesson() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course") || "genai-rag-architect";
    const lessonId = params.get("lesson");

    const courses = window.SKILLFORGE_COURSES || [];
    this.currentCourse = courses.find(c => c.id === courseId) || courses[0];

    if (!this.currentCourse) {
      console.error("Course not found");
      return;
    }

    if (lessonId) {
      this.currentLesson = this.currentCourse.lessons.find(l => l.id === lessonId) || this.currentCourse.lessons[0];
    } else {
      this.currentLesson = this.currentCourse.lessons[0];
    }

    // Record last activity
    if (window.SkillForgeStorage) {
      window.SkillForgeStorage.setLastActivity(this.currentCourse.id, this.currentLesson.id);
    }

    this.renderSidebar();
    this.renderLessonHeader();
    this.renderLessonContent();
    this.renderQuiz();
    this.renderNotes();
    this.renderNavigationButtons();

    if (window.lucide) window.lucide.createIcons();
    if (window.Prism) window.Prism.highlightAll();
  },

  renderSidebar() {
    const sidebar = document.getElementById("courseSidebar");
    if (!sidebar) return;

    const progress = window.SkillForgeStorage ? window.SkillForgeStorage.getCourseProgress(this.currentCourse.id) : { percent: 0, completed: 0, total: 0 };

    const lessonsHtml = this.currentCourse.lessons.map((lesson, idx) => {
      const isCompleted = window.SkillForgeStorage ? window.SkillForgeStorage.isLessonCompleted(lesson.id) : false;
      const isActive = lesson.id === this.currentLesson.id;

      return `
        <a href="course.html?course=${this.currentCourse.id}&lesson=${lesson.id}" 
           class="group flex items-start gap-3 p-3 rounded-xl transition-all ${
             isActive 
               ? "bg-indigo-600/15 border border-indigo-500/30 text-white" 
               : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
           }">
          <div class="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
            isCompleted 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
              : isActive 
                ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50" 
                : "bg-slate-800 text-slate-500 border border-slate-700"
          }">
            ${isCompleted ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : (idx + 1)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="text-xs font-medium truncate ${isActive ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}">
                ${lesson.title}
              </span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-500">
              <span>${lesson.readTime}</span>
              ${isCompleted ? '<span class="text-emerald-400 font-medium">• Completed</span>' : ''}
            </div>
          </div>
        </a>
      `;
    }).join("");

    sidebar.innerHTML = `
      <div class="p-4 border-b border-slate-800">
        <a href="catalog.html" class="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mb-2 font-medium">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Tracks
        </a>
        <h2 class="text-base font-bold text-white leading-snug">${this.currentCourse.title}</h2>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Track Progress</span>
            <span class="text-indigo-300">${progress.percent}% (${progress.completed}/${progress.total})</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div class="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style="width: ${progress.percent}%"></div>
          </div>
        </div>
      </div>

      <div class="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
        ${lessonsHtml}
      </div>

      ${progress.percent === 100 ? `
        <div class="p-4 m-3 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-center">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2">
            <i data-lucide="award" class="w-5 h-5"></i>
          </div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Track Completed!</h4>
          <p class="text-[11px] text-slate-400 mt-1 mb-2.5">Claim your verified certificate of completion.</p>
          <a href="profile.html?claim=${this.currentCourse.id}" class="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md">
            <span>View Certificate</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
        </div>
      ` : ''}
    `;
  },

  renderLessonHeader() {
    const header = document.getElementById("lessonHeader");
    if (!header) return;

    const isCompleted = window.SkillForgeStorage ? window.SkillForgeStorage.isLessonCompleted(this.currentLesson.id) : false;
    const isBookmarked = window.SkillForgeStorage ? window.SkillForgeStorage.isBookmarked(this.currentLesson.id) : false;

    header.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ${this.currentCourse.category}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3"></i> ${this.currentLesson.readTime}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              ${this.currentCourse.level}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">${this.currentLesson.title}</h1>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button id="bookmarkBtn" onclick="SkillForgePlayer.toggleBookmark()" 
                  class="p-2.5 rounded-xl border transition-all ${
                    isBookmarked 
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-300' 
                      : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }" title="Bookmark lesson">
            <i data-lucide="bookmark" class="w-4 h-4 ${isBookmarked ? 'fill-amber-300' : ''}"></i>
          </button>

          <button id="completeBtn" onclick="SkillForgePlayer.toggleCompleted()" 
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-md ${
                    isCompleted 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
                  }">
            <i data-lucide="${isCompleted ? 'check-circle' : 'circle'}" class="w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}"></i>
            <span>${isCompleted ? 'Completed' : 'Mark as Complete'}</span>
          </button>
        </div>
      </div>

      <!-- Mode Selector (Working Professional Dual Mode) -->
      <div class="flex items-center justify-between mt-6 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 max-w-md">
        <button id="tabSummary" onclick="SkillForgePlayer.switchMode('summary')" 
                class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  this.activeMode === 'summary' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }">
          <i data-lucide="briefcase" class="w-3.5 h-3.5"></i>
          <span>Executive Summary</span>
          <span class="text-[10px] opacity-80 font-normal">(5 min)</span>
        </button>

        <button id="tabDeepDive" onclick="SkillForgePlayer.switchMode('deepdive')" 
                class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  this.activeMode === 'deepdive' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }">
          <i data-lucide="code" class="w-3.5 h-3.5"></i>
          <span>Deep Dive Lab</span>
          <span class="text-[10px] opacity-80 font-normal">(Hands-on)</span>
        </button>
      </div>
    `;
  },

  switchMode(mode) {
    this.activeMode = mode;
    this.renderLessonHeader();
    this.renderLessonContent();
    if (window.lucide) window.lucide.createIcons();
    if (window.Prism) window.Prism.highlightAll();
  },

  renderLessonContent() {
    const container = document.getElementById("lessonContentArea");
    if (!container) return;

    if (this.activeMode === "summary") {
      const summary = this.currentLesson.summary;
      container.innerHTML = `
        <div class="space-y-6">
          <!-- Key Takeaway Card -->
          <div class="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
            <div class="flex items-center gap-2 mb-2 font-semibold text-white">
              <i data-lucide="zap" class="w-5 h-5 text-indigo-400"></i>
              <h3 class="text-sm uppercase tracking-wider font-bold text-indigo-300">Executive Takeaway</h3>
            </div>
            <p class="text-sm sm:text-base leading-relaxed text-indigo-100/90 font-medium">
              ${summary.keyTakeaway}
            </p>
          </div>

          <!-- Architecture Flow Card -->
          <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div class="flex items-center gap-2 mb-3 text-white font-semibold">
              <i data-lucide="workflow" class="w-5 h-5 text-cyan-400"></i>
              <h3 class="text-sm uppercase tracking-wider font-bold text-cyan-300">Architecture Pipeline</h3>
            </div>
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-cyan-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
${summary.architectureNotes}
            </div>
          </div>

          <!-- Anti-Patterns Alert -->
          <div class="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-200">
            <div class="flex items-center gap-2 mb-2 text-rose-400 font-semibold">
              <i data-lucide="alert-triangle" class="w-5 h-5"></i>
              <h3 class="text-sm uppercase tracking-wider font-bold">Anti-Patterns & Pitfalls to Avoid</h3>
            </div>
            <p class="text-sm leading-relaxed text-rose-100/80">
              ${summary.antiPatterns}
            </p>
          </div>

          <!-- Prompt to switch to lab -->
          <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              Ready to view production code and test configuration?
            </div>
            <button onclick="SkillForgePlayer.switchMode('deepdive')" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Switch to Deep Dive Lab <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Query Desk Callout -->
          <div class="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <i data-lucide="help-circle" class="w-4 h-4 text-indigo-400 shrink-0"></i>
              <span class="text-xs text-slate-300">Need clarification on this architecture or corporate training?</span>
            </div>
            <a href="query.html?track=${encodeURIComponent(this.currentCourse.title)}&subject=${encodeURIComponent('Architecture Query: ' + this.currentLesson.title)}" 
               class="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 shrink-0">
              <span>Ask an Architect</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </a>
          </div>
        </div>
      `;
    } else {
      const deep = this.currentLesson.deepDive;
      container.innerHTML = `
        <div class="space-y-6">
          <!-- In-depth concept description -->
          <div class="text-sm sm:text-base text-slate-300 leading-relaxed">
            ${deep.concept}
          </div>

          <!-- Code / Configuration Container -->
          <div class="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
            <div class="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 font-mono text-xs text-slate-300">
                <i data-lucide="file-code" class="w-4 h-4 text-indigo-400"></i>
                <span>${deep.codeTitle}</span>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="SkillForgePlayer.copyCode()" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors">
                  <i data-lucide="copy" class="w-3 h-3"></i>
                  <span id="copyBtnText">Copy</span>
                </button>
                <a href="playground.html" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-[11px] text-white transition-colors">
                  <i data-lucide="terminal" class="w-3 h-3"></i>
                  <span>Run in Sandbox</span>
                </a>
              </div>
            </div>
            <pre class="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-slate-200"><code class="language-${deep.codeLang}">${this.escapeHtml(deep.code)}</code></pre>
          </div>

          <!-- Production Troubleshooting -->
          <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <div class="flex items-center gap-2 mb-2 text-amber-400 font-semibold">
              <i data-lucide="wrench" class="w-4 h-4"></i>
              <h3 class="text-xs uppercase tracking-wider font-bold">Production Troubleshooting & Edge Cases</h3>
            </div>
            <p class="text-xs sm:text-sm leading-relaxed text-slate-400">
              ${deep.troubleshooting}
            </p>
          </div>

          <!-- Query Desk Callout -->
          <div class="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <i data-lucide="help-circle" class="w-4 h-4 text-indigo-400 shrink-0"></i>
              <span class="text-xs text-slate-300">Encountering an edge case or need staff advice on this configuration?</span>
            </div>
            <a href="query.html?track=${encodeURIComponent(this.currentCourse.title)}&subject=${encodeURIComponent('Code Query: ' + this.currentLesson.title)}" 
               class="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 shrink-0">
              <span>Submit Query Ticket</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </a>
          </div>
        </div>
      `;
    }
  },

  renderQuiz() {
    const quizCard = document.getElementById("lessonQuizArea");
    if (!quizCard || !this.currentLesson.quiz) return;

    const quiz = this.currentLesson.quiz;
    const quizResults = window.SkillForgeStorage ? window.SkillForgeStorage.getQuizResults() : {};
    const existingResult = quizResults[this.currentLesson.id];

    quizCard.innerHTML = `
      <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div class="flex items-center justify-between gap-2 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <i data-lucide="help-circle" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Professional Knowledge Check</h3>
              <p class="text-[11px] text-slate-400">Real-world scenario challenge</p>
            </div>
          </div>
          ${existingResult && existingResult.passed ? `
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <i data-lucide="check" class="w-3 h-3"></i> Passed
            </span>
          ` : ''}
        </div>

        <p class="text-sm sm:text-base font-semibold text-slate-200 mb-4">
          ${quiz.question}
        </p>

        <div class="space-y-2.5 mb-5" id="quizOptionsList">
          ${quiz.options.map((opt, idx) => `
            <label class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 cursor-pointer transition-all option-item text-xs sm:text-sm text-slate-300">
              <input type="radio" name="quizOption" value="${idx}" class="mt-0.5 text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700">
              <span class="flex-1">${opt}</span>
            </label>
          `).join("")}
        </div>

        <div id="quizFeedback" class="hidden mb-4 p-4 rounded-xl text-xs sm:text-sm"></div>

        <div class="flex items-center justify-between">
          <button id="submitQuizBtn" onclick="SkillForgePlayer.submitQuiz()" 
                  class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center gap-1.5">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
            <span>Validate Answer</span>
          </button>
          <span class="text-[11px] text-slate-500">Passing automatically marks lesson complete.</span>
        </div>
      </div>
    `;
  },

  submitQuiz() {
    const selected = document.querySelector('input[name="quizOption"]:checked');
    const feedback = document.getElementById("quizFeedback");
    if (!selected) {
      if (window.SkillForgeApp) window.SkillForgeApp.showToast("Please choose an option first", "error");
      return;
    }

    const answerIndex = parseInt(selected.value, 10);
    const quiz = this.currentLesson.quiz;
    const isCorrect = answerIndex === quiz.correctIndex;

    feedback.classList.remove("hidden");
    if (isCorrect) {
      feedback.className = "mb-4 p-4 rounded-xl text-xs sm:text-sm bg-emerald-950/60 border border-emerald-500/40 text-emerald-200";
      feedback.innerHTML = `
        <div class="font-bold flex items-center gap-1.5 mb-1 text-emerald-400">
          <i data-lucide="check-circle" class="w-4 h-4"></i> Correct Solution!
        </div>
        <p class="leading-relaxed">${quiz.explanation}</p>
      `;

      if (window.SkillForgeStorage) {
        window.SkillForgeStorage.saveQuizResult(this.currentLesson.id, true, 100);
      }
      if (window.SkillForgeApp) {
        window.SkillForgeApp.showToast("Knowledge check passed! Lesson marked complete.", "success");
      }

      // Celebrate with confetti if library loaded
      if (window.confetti) {
        window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }

      this.renderSidebar();
      this.renderLessonHeader();
    } else {
      feedback.className = "mb-4 p-4 rounded-xl text-xs sm:text-sm bg-rose-950/60 border border-rose-500/40 text-rose-200";
      feedback.innerHTML = `
        <div class="font-bold flex items-center gap-1.5 mb-1 text-rose-400">
          <i data-lucide="alert-circle" class="w-4 h-4"></i> Architectural Misalignment
        </div>
        <p class="leading-relaxed">${quiz.explanation}</p>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderNotes() {
    const notesArea = document.getElementById("lessonNotesArea");
    if (!notesArea) return;

    const savedNote = window.SkillForgeStorage ? window.SkillForgeStorage.getLessonNote(this.currentLesson.id) : "";

    notesArea.innerHTML = `
      <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-indigo-400"></i>
            <h3 class="text-xs uppercase tracking-wider font-bold text-white">Private Engineering Scratchpad</h3>
          </div>
          <span id="noteSavedStatus" class="text-[11px] text-slate-500">Auto-saves locally</span>
        </div>
        <textarea id="lessonNotesInput" rows="4" 
                  placeholder="Record your architectural thoughts, production caveats, or questions for your team..." 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y font-mono">${savedNote}</textarea>
        <div class="flex justify-end mt-2">
          <button onclick="SkillForgePlayer.saveNote()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1">
            <i data-lucide="save" class="w-3 h-3"></i>
            <span>Save Note</span>
          </button>
        </div>
      </div>
    `;

    const input = document.getElementById("lessonNotesInput");
    if (input) {
      let timeout = null;
      input.addEventListener("input", () => {
        const status = document.getElementById("noteSavedStatus");
        if (status) status.innerText = "Saving...";
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.saveNote(true);
        }, 1000);
      });
    }
  },

  saveNote(silent = false) {
    const input = document.getElementById("lessonNotesInput");
    if (!input || !window.SkillForgeStorage) return;

    window.SkillForgeStorage.saveLessonNote(this.currentLesson.id, input.value);
    const status = document.getElementById("noteSavedStatus");
    if (status) {
      status.innerText = "Saved to localStorage";
      setTimeout(() => {
        status.innerText = "Auto-saves locally";
      }, 2000);
    }
    if (!silent && window.SkillForgeApp) {
      window.SkillForgeApp.showToast("Note saved successfully", "success");
    }
  },

  renderNavigationButtons() {
    const navContainer = document.getElementById("lessonNavFooter");
    if (!navContainer) return;

    const lessons = this.currentCourse.lessons;
    const currentIndex = lessons.findIndex(l => l.id === this.currentLesson.id);

    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    navContainer.innerHTML = `
      <div class="flex items-center justify-between gap-4 pt-6 border-t border-slate-800">
        ${prevLesson ? `
          <a href="course.html?course=${this.currentCourse.id}&lesson=${prevLesson.id}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <div class="text-left">
              <span class="block text-[10px] text-slate-400">Previous</span>
              <span class="hidden sm:inline truncate max-w-xs">${prevLesson.title}</span>
            </div>
          </a>
        ` : '<div></div>'}

        ${nextLesson ? `
          <a href="course.html?course=${this.currentCourse.id}&lesson=${nextLesson.id}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md">
            <div class="text-right">
              <span class="block text-[10px] text-indigo-200">Next Up</span>
              <span class="hidden sm:inline truncate max-w-xs">${nextLesson.title}</span>
            </div>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        ` : `
          <a href="profile.html?claim=${this.currentCourse.id}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md">
            <span>Complete Track &amp; Claim Certificate</span>
            <i data-lucide="award" class="w-4 h-4"></i>
          </a>
        `}
      </div>
    `;
  },

  toggleCompleted() {
    if (!window.SkillForgeStorage) return;
    const isNowCompleted = window.SkillForgeStorage.toggleLessonCompleted(this.currentLesson.id);
    this.renderSidebar();
    this.renderLessonHeader();
    if (window.lucide) window.lucide.createIcons();
    if (window.SkillForgeApp) {
      window.SkillForgeApp.showToast(isNowCompleted ? "Lesson completed!" : "Marked incomplete", "info");
    }
  },

  toggleBookmark() {
    if (!window.SkillForgeStorage) return;
    const isBookmarked = window.SkillForgeStorage.toggleBookmark(this.currentLesson.id);
    this.renderLessonHeader();
    if (window.lucide) window.lucide.createIcons();
    if (window.SkillForgeApp) {
      window.SkillForgeApp.showToast(isBookmarked ? "Lesson bookmarked" : "Bookmark removed", "info");
    }
  },

  copyCode() {
    if (!this.currentLesson || !this.currentLesson.deepDive) return;
    navigator.clipboard.writeText(this.currentLesson.deepDive.code).then(() => {
      const btnText = document.getElementById("copyBtnText");
      if (btnText) {
        btnText.innerText = "Copied!";
        setTimeout(() => { btnText.innerText = "Copy"; }, 2000);
      }
      if (window.SkillForgeApp) window.SkillForgeApp.showToast("Code copied to clipboard", "success");
    });
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },

  bindEvents() {
    window.addEventListener("popstate", () => {
      this.loadCourseAndLesson();
    });
  }
};

window.SkillForgePlayer = SkillForgePlayer;
