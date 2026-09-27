/**
 * SkillForge Pro - Global Application Controller
 * Handles navigation, theme toggle, toast notifications, and global listeners.
 */

const SkillForgeApp = {
  init() {
    this.initTheme();
    this.renderHeader();
    this.renderFooter();
    this.initResumeBanner();
    this.bindEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  initTheme() {
    const savedTheme = window.SkillForgeStorage ? window.SkillForgeStorage.getTheme() : "dark";
    document.body.classList.toggle("light-theme", savedTheme === "light");
  },

  toggleTheme() {
    const isLight = document.body.classList.contains("light-theme");
    const newTheme = isLight ? "dark" : "light";
    if (window.SkillForgeStorage) {
      window.SkillForgeStorage.setTheme(newTheme);
    }
    const icon = document.getElementById("themeIcon");
    if (icon) {
      icon.setAttribute("data-lucide", newTheme === "light" ? "moon" : "sun");
      if (window.lucide) window.lucide.createIcons();
    }
    this.showToast(`Switched to ${newTheme} mode`, "info");
  },

  renderHeader() {
    const headerContainer = document.getElementById("mainHeader");
    if (!headerContainer) return;

    const currentPath = window.location.pathname.toLowerCase();
    const isLight = document.body.classList.contains("light-theme");

    const navItems = [
      { label: "Dashboard", href: "index.html", icon: "layout-dashboard" },
      { label: "Resume RAG AI", href: "resume-rag.html", icon: "bot" },
      { label: "Curriculum Tracks", href: "catalog.html", icon: "book-open" },
      { label: "Cloud & AI Sandbox", href: "playground.html", icon: "terminal" },
      { label: "Query Desk", href: "query.html", icon: "help-circle" },
      { label: "My Profile & Certs", href: "profile.html", icon: "award" }
    ];

    const navHtml = navItems.map(item => {
      const active = currentPath.endsWith(item.href) || (item.href === "index.html" && (currentPath.endsWith("/") || currentPath.endsWith("index.html")));
      return `
        <a href="${item.href}" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          active 
            ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" 
            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
        }">
          <i data-lucide="${item.icon}" class="w-4 h-4"></i>
          <span>${item.label}</span>
        </a>
      `;
    }).join("");

    headerContainer.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <a href="index.html" class="flex items-center gap-2.5 group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <i data-lucide="cpu" class="w-5 h-5 text-white"></i>
              </div>
              <div>
                <span class="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  SkillForge <span class="text-xs uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Pro</span>
                </span>
                <p class="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase font-semibold">Senior Tech Upskilling</p>
              </div>
            </a>
          </div>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex items-center gap-2">
            ${navHtml}
          </nav>

          <!-- Right Action controls -->
          <div class="flex items-center gap-3">
            <button id="themeToggleBtn" onclick="SkillForgeApp.toggleTheme()" class="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-colors" title="Toggle Theme">
              <i id="themeIcon" data-lucide="${isLight ? 'moon' : 'sun'}" class="w-4 h-4"></i>
            </button>

            <a href="catalog.html" class="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]">
              <i data-lucide="compass" class="w-3.5 h-3.5"></i>
              <span>Explore Tracks</span>
            </a>

            <!-- Mobile menu button -->
            <button id="mobileMenuBtn" class="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800" onclick="SkillForgeApp.toggleMobileMenu()">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Dropdown Nav -->
      <div id="mobileMenu" class="hidden md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-1">
        ${navHtml}
      </div>
    `;
  },

  toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) {
      menu.classList.toggle("hidden");
    }
  },

  renderFooter() {
    const footerContainer = document.getElementById("mainFooter");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-800/80">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <i data-lucide="terminal" class="w-4 h-4 text-indigo-400"></i>
            </div>
            <span class="text-sm font-semibold text-slate-300">SkillForge Pro • Enterprise Static Learning System</span>
          </div>

          <p class="text-xs text-slate-500 text-center md:text-left">
            Crafted for Staff Engineers, Tech Leads, and Architects. 100% Client-Side &amp; Static.
          </p>

          <div class="flex items-center gap-4 text-xs text-slate-400">
            <a href="resume-rag.html" class="hover:text-indigo-400 transition-colors">Resume RAG</a>
            <span class="text-slate-700">•</span>
            <a href="catalog.html" class="hover:text-indigo-400 transition-colors">Catalog</a>
            <span class="text-slate-700">•</span>
            <a href="playground.html" class="hover:text-indigo-400 transition-colors">Sandbox</a>
            <span class="text-slate-700">•</span>
            <a href="query.html" class="hover:text-indigo-400 transition-colors">Query Desk</a>
            <span class="text-slate-700">•</span>
            <a href="profile.html" class="hover:text-indigo-400 transition-colors">Verifiable Certs</a>
          </div>
        </div>
      </div>
    `;
  },

  initResumeBanner() {
    const bannerContainer = document.getElementById("quickResumeBanner");
    if (!bannerContainer || !window.SkillForgeStorage) return;

    const lastActivity = window.SkillForgeStorage.getLastActivity();
    if (!lastActivity) {
      bannerContainer.classList.add("hidden");
      return;
    }

    const courses = window.SKILLFORGE_COURSES || [];
    const course = courses.find(c => c.id === lastActivity.courseId);
    if (!course) return;

    const lesson = course.lessons.find(l => l.id === lastActivity.lessonId) || course.lessons[0];

    bannerContainer.innerHTML = `
      <div class="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-cyan-950/70 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <i data-lucide="play-circle" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="text-xs uppercase tracking-wider font-semibold text-indigo-400">Resume Recent Lesson</span>
            <h4 class="text-sm font-semibold text-white hover:text-indigo-300 transition-colors">
              ${course.title}: <span class="font-normal text-slate-300">${lesson.title}</span>
            </h4>
          </div>
        </div>
        <a href="course.html?course=${course.id}&lesson=${lesson.id}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md">
          <span>Continue Lesson</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    `;
    bannerContainer.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const colors = {
      success: "border-emerald-500/40 bg-emerald-950/90 text-emerald-200",
      error: "border-rose-500/40 bg-rose-950/90 text-rose-200",
      info: "border-indigo-500/40 bg-slate-900/95 text-indigo-200"
    };

    const icons = {
      success: "check-circle",
      error: "alert-circle",
      info: "info"
    };

    toast.className = `border px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 translate-y-2 opacity-0 text-xs font-medium ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  bindEvents() {
    window.addEventListener("skillforge:progress-updated", () => {
      this.initResumeBanner();
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  SkillForgeApp.init();
});

window.SkillForgeApp = SkillForgeApp;
