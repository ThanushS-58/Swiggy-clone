/**
 * SkillForge Pro - Storage Management Engine
 * Wraps localStorage to provide reactive, safe state persistence
 * for completed lessons, quiz scores, personal notes, bookmarks, and user profile.
 */

const STORAGE_KEYS = {
  PROFILE: "skillforge_profile",
  PROGRESS: "skillforge_progress", // Array of completed lesson IDs
  QUIZ_RESULTS: "skillforge_quiz_results", // Object { [lessonId]: { passed, score, timestamp } }
  NOTES: "skillforge_notes", // Object { [lessonId]: "markdown/text note" }
  BOOKMARKS: "skillforge_bookmarks", // Array of lesson IDs
  LAST_ACTIVITY: "skillforge_last_activity", // { courseId, lessonId, timestamp }
  THEME: "skillforge_theme", // "dark" | "light"
  CERTIFICATES: "skillforge_certs", // Object { [courseId]: { certId, issueDate, userFullName } }
  QUERIES: "skillforge_queries" // Array of submitted query objects
};

const SkillForgeStorage = {
  // --- Profile Management ---
  getProfile() {
    const defaultProfile = {
      fullName: "Alex Rivera",
      jobTitle: "Senior Software Engineer",
      primaryTrack: "Generative AI & Cloud Architecture",
      weeklyGoalHours: 5,
      avatarUrl: ""
    };
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...defaultProfile, ...JSON.parse(data) } : defaultProfile;
    } catch (e) {
      console.warn("Error reading profile from storage", e);
      return defaultProfile;
    }
  },

  saveProfile(profileData) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
      window.dispatchEvent(new CustomEvent("skillforge:profile-updated", { detail: profileData }));
    } catch (e) {
      console.error("Error saving profile", e);
    }
  },

  // --- Lesson Progress ---
  getCompletedLessons() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isLessonCompleted(lessonId) {
    return this.getCompletedLessons().includes(lessonId);
  },

  toggleLessonCompleted(lessonId) {
    const completed = this.getCompletedLessons();
    const index = completed.indexOf(lessonId);
    let isNowCompleted = false;

    if (index > -1) {
      completed.splice(index, 1);
    } else {
      completed.push(lessonId);
      isNowCompleted = true;
    }

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(completed));
    window.dispatchEvent(new CustomEvent("skillforge:progress-updated", {
      detail: { lessonId, isNowCompleted, completedCount: completed.length }
    }));
    return isNowCompleted;
  },

  getCourseProgress(courseId) {
    const courses = window.SKILLFORGE_COURSES || [];
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.lessons.length) return { completed: 0, total: 0, percent: 0 };

    const completedList = this.getCompletedLessons();
    const total = course.lessons.length;
    const completed = course.lessons.filter(l => completedList.includes(l.id)).length;
    const percent = Math.round((completed / total) * 100);

    return { completed, total, percent };
  },

  // --- Quiz Results ---
  getQuizResults() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveQuizResult(lessonId, passed, score) {
    const results = this.getQuizResults();
    results[lessonId] = {
      passed,
      score,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results));
    
    // Auto-mark lesson completed if quiz is passed!
    if (passed && !this.isLessonCompleted(lessonId)) {
      this.toggleLessonCompleted(lessonId);
    }
  },

  // --- Lesson Notes ---
  getNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  getLessonNote(lessonId) {
    return this.getNotes()[lessonId] || "";
  },

  saveLessonNote(lessonId, content) {
    const notes = this.getNotes();
    notes[lessonId] = content;
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  // --- Bookmarks ---
  getBookmarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isBookmarked(lessonId) {
    return this.getBookmarks().includes(lessonId);
  },

  toggleBookmark(lessonId) {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.indexOf(lessonId);
    let bookmarked = false;

    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(lessonId);
      bookmarked = true;
    }

    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return bookmarked;
  },

  // --- Last Activity for Quick Resume ---
  setLastActivity(courseId, lessonId) {
    const activity = {
      courseId,
      lessonId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, JSON.stringify(activity));
  },

  getLastActivity() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // --- Certificates ---
  getCertificates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  issueCertificate(courseId, userFullName) {
    const certs = this.getCertificates();
    const certId = "SF-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString(36).toUpperCase();
    certs[courseId] = {
      certId,
      issueDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      userFullName: userFullName || this.getProfile().fullName
    };
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
    return certs[courseId];
  },

  // --- Theme ---
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.body.classList.toggle("light-theme", theme === "light");
  },

  // --- Queries & Technical Inquiries ---
  getQueries() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUERIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveQuery(queryData) {
    const queries = this.getQueries();
    const newQuery = {
      id: "SF-TICK-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: "Under Review by Senior Architect",
      ...queryData
    };
    queries.unshift(newQuery);
    localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(queries));
    window.dispatchEvent(new CustomEvent("skillforge:query-submitted", { detail: newQuery }));
    return newQuery;
  },

  deleteQuery(queryId) {
    let queries = this.getQueries();
    queries = queries.filter(q => q.id !== queryId);
    localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(queries));
  },

  // --- Export & Import ---
  exportBackup() {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      progress: this.getCompletedLessons(),
      quizResults: this.getQuizResults(),
      notes: this.getNotes(),
      bookmarks: this.getBookmarks(),
      certificates: this.getCertificates(),
      queries: this.getQueries()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
      if (parsed.progress) localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(parsed.progress));
      if (parsed.quizResults) localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(parsed.quizResults));
      if (parsed.notes) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(parsed.notes));
      if (parsed.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(parsed.bookmarks));
      if (parsed.certificates) localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(parsed.certificates));
      if (parsed.queries) localStorage.setItem(STORAGE_KEYS.QUERIES, JSON.stringify(parsed.queries));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

window.SkillForgeStorage = SkillForgeStorage;
