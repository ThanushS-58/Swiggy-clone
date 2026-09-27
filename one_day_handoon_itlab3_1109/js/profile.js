/**
 * SkillForge Pro - Profile & Analytics Controller
 * Manages user profile settings, skill matrix computation, earned certificates, and data export/import.
 */

const SkillForgeProfile = {
  activeCertCourseId: null,

  init() {
    this.renderProfileHeader();
    this.renderStatsOverview();
    this.renderSkillMatrix();
    this.renderCertificates();
    this.checkUrlForClaim();
    if (window.lucide) window.lucide.createIcons();
  },

  checkUrlForClaim() {
    const params = new URLSearchParams(window.location.search);
    const claimCourseId = params.get("claim");
    if (claimCourseId) {
      setTimeout(() => {
        this.openCertificateModal(claimCourseId);
      }, 300);
    }
  },

  renderProfileHeader() {
    const header = document.getElementById("profileHeader");
    if (!header || !window.SkillForgeStorage) return;

    const profile = window.SkillForgeStorage.getProfile();

    header.innerHTML = `
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-2xl">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            ${profile.fullName ? profile.fullName.charAt(0) : "E"}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-extrabold text-white" id="displayName">${profile.fullName}</h1>
              <button onclick="SkillForgeProfile.openEditModal()" class="text-slate-400 hover:text-white transition-colors" title="Edit Profile">
                <i data-lucide="edit-2" class="w-4 h-4"></i>
              </button>
            </div>
            <p class="text-sm text-indigo-300 font-medium" id="displayRole">${profile.jobTitle}</p>
            <p class="text-xs text-slate-400 mt-0.5">Focus: ${profile.primaryTrack}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="SkillForgeProfile.exportData()" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>Export Backup</span>
          </button>
          <label class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer">
            <i data-lucide="upload" class="w-4 h-4"></i>
            <span>Import Backup</span>
            <input type="file" id="importFileInput" onchange="SkillForgeProfile.importData(event)" class="hidden" accept=".json">
          </label>
        </div>
      </div>
    `;
  },

  renderStatsOverview() {
    const container = document.getElementById("statsOverview");
    if (!container || !window.SkillForgeStorage) return;

    const completed = window.SkillForgeStorage.getCompletedLessons();
    const courses = window.SKILLFORGE_COURSES || [];
    let totalLessons = 0;
    courses.forEach(c => totalLessons += c.lessons.length);

    const quizResults = window.SkillForgeStorage.getQuizResults();
    const passedQuizzes = Object.values(quizResults).filter(q => q.passed).length;
    const certs = window.SkillForgeStorage.getCertificates();
    const certCount = Object.keys(certs).length;

    const stats = [
      { label: "Lessons Completed", val: `${completed.length} / ${totalLessons}`, icon: "check-circle", color: "text-emerald-400" },
      { label: "Quizzes Mastered", val: passedQuizzes, icon: "zap", color: "text-amber-400" },
      { label: "Specializations Earned", val: certCount, icon: "award", color: "text-indigo-400" },
      { label: "Upskilling Velocity", val: "Top 5%", icon: "trending-up", color: "text-cyan-400" }
    ];

    container.innerHTML = stats.map(s => `
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">${s.label}</span>
          <i data-lucide="${s.icon}" class="w-4 h-4 ${s.color}"></i>
        </div>
        <div class="text-2xl font-extrabold text-white">${s.val}</div>
      </div>
    `).join("");
  },

  renderSkillMatrix() {
    const container = document.getElementById("skillMatrixGrid");
    if (!container || !window.SkillForgeStorage) return;

    const courses = window.SKILLFORGE_COURSES || [];

    container.innerHTML = courses.map(course => {
      const progress = window.SkillForgeStorage.getCourseProgress(course.id);
      let statusLabel = "Not Started";
      let statusColor = "bg-slate-800 text-slate-400 border-slate-700";

      if (progress.percent === 100) {
        statusLabel = "Verified Architect";
        statusColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      } else if (progress.percent > 0) {
        statusLabel = "In Progress";
        statusColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      }

      return `
        <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-semibold text-indigo-400 uppercase">${course.category}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}">
                ${statusLabel}
              </span>
            </div>
            <h3 class="text-base font-bold text-white mb-2">${course.title}</h3>
            <p class="text-xs text-slate-400 mb-4 line-clamp-2">${course.overview}</p>
          </div>

          <div>
            <div class="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Competency Index</span>
              <span class="text-white">${progress.percent}%</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700 mb-4">
              <div class="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style="width: ${progress.percent}%"></div>
            </div>

            <div class="flex items-center justify-between gap-2">
              <a href="course.html?course=${course.id}" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Go to Labs <i data-lucide="arrow-right" class="w-3 h-3"></i>
              </a>
              ${progress.percent === 100 ? `
                <button onclick="SkillForgeProfile.openCertificateModal('${course.id}')" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <i data-lucide="award" class="w-3.5 h-3.5"></i> Certificate
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  renderCertificates() {
    const container = document.getElementById("certsListArea");
    if (!container || !window.SkillForgeStorage) return;

    const courses = window.SKILLFORGE_COURSES || [];
    const certs = window.SkillForgeStorage.getCertificates();

    const certCards = courses.map(course => {
      const progress = window.SkillForgeStorage.getCourseProgress(course.id);
      const isComplete = progress.percent === 100;
      const certRecord = certs[course.id];

      return `
        <div class="p-6 rounded-2xl border ${isComplete ? 'bg-slate-900/90 border-indigo-500/30' : 'bg-slate-950/40 border-slate-800/80 opacity-75'} flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isComplete ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40' : 'bg-slate-800 text-slate-600'}">
              <i data-lucide="award" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400">${course.category}</span>
                ${isComplete ? '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">Ready</span>' : '<span class="text-xs text-slate-500">In Progress</span>'}
              </div>
              <h3 class="text-base font-bold text-white">${course.title}</h3>
              <p class="text-xs text-slate-400 mt-0.5">
                ${certRecord ? `Issued on ${certRecord.issueDate} • Hash: ${certRecord.certId}` : `${progress.completed}/${progress.total} lessons completed`}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            ${isComplete ? `
              <button onclick="SkillForgeProfile.openCertificateModal('${course.id}')" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>View &amp; Export Certificate</span>
              </button>
            ` : `
              <a href="course.html?course=${course.id}" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
                <span>Complete Track</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            `}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = certCards;
  },

  openCertificateModal(courseId) {
    this.activeCertCourseId = courseId;
    const courses = window.SKILLFORGE_COURSES || [];
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const profile = window.SkillForgeStorage.getProfile();
    let cert = window.SkillForgeStorage.getCertificates()[courseId];

    if (!cert) {
      cert = window.SkillForgeStorage.issueCertificate(courseId, profile.fullName);
      this.renderCertificates();
      this.renderStatsOverview();
    }

    const modal = document.getElementById("certModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Render onto canvas
    setTimeout(() => {
      if (window.SkillForgeCert) {
        window.SkillForgeCert.renderCertificate("certificateCanvas", {
          userFullName: profile.fullName,
          courseTitle: course.title,
          category: course.category,
          level: course.level,
          issueDate: cert.issueDate,
          certId: cert.certId
        });
      }
    }, 50);

    if (window.lucide) window.lucide.createIcons();
  },

  closeCertificateModal() {
    const modal = document.getElementById("certModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  },

  downloadCert() {
    if (window.SkillForgeCert) {
      window.SkillForgeCert.download("certificateCanvas", `SkillForge_${this.activeCertCourseId}_Certificate.png`);
    }
  },

  printCert() {
    if (window.SkillForgeCert) {
      window.SkillForgeCert.print("certificateCanvas");
    }
  },

  openEditModal() {
    const modal = document.getElementById("editProfileModal");
    if (!modal || !window.SkillForgeStorage) return;

    const profile = window.SkillForgeStorage.getProfile();
    document.getElementById("inputFullName").value = profile.fullName;
    document.getElementById("inputJobTitle").value = profile.jobTitle;
    document.getElementById("inputPrimaryTrack").value = profile.primaryTrack;

    modal.classList.remove("hidden");
  },

  closeEditModal() {
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.classList.add("hidden");
  },

  saveProfileChanges() {
    if (!window.SkillForgeStorage) return;

    const updated = {
      fullName: document.getElementById("inputFullName").value.trim() || "Engineering Professional",
      jobTitle: document.getElementById("inputJobTitle").value.trim() || "Software Engineer",
      primaryTrack: document.getElementById("inputPrimaryTrack").value.trim() || "Generative AI & Cloud Architecture"
    };

    window.SkillForgeStorage.saveProfile(updated);
    this.closeEditModal();
    this.renderProfileHeader();
    this.renderCertificates();
    if (window.SkillForgeApp) window.SkillForgeApp.showToast("Profile details updated", "success");
    if (window.lucide) window.lucide.createIcons();
  },

  exportData() {
    if (!window.SkillForgeStorage) return;
    const jsonStr = window.SkillForgeStorage.exportBackup();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SkillForge_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (window.SkillForgeApp) window.SkillForgeApp.showToast("Progress backup exported as JSON", "success");
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = window.SkillForgeStorage.importBackup(e.target.result);
      if (res.success) {
        if (window.SkillForgeApp) window.SkillForgeApp.showToast("Progress imported successfully!", "success");
        setTimeout(() => window.location.reload(), 800);
      } else {
        if (window.SkillForgeApp) window.SkillForgeApp.showToast("Failed to import file: " + res.error, "error");
      }
    };
    reader.readAsText(file);
  }
};

window.SkillForgeProfile = SkillForgeProfile;
