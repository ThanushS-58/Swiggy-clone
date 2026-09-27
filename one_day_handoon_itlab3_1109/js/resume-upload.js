/* Client-side resume ingestion for the Resume RAG page. */
(function () {
  const STORAGE_KEY = "skillforge_uploaded_resume";
  const MAX_FILE_SIZE = 8 * 1024 * 1024;

  function cleanText(text) {
    return (text || "")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function inferMetadata(text, fileName) {
    const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [""])[0];
    const phone = (text.match(/(?:\+?\d[\d ()-]{8,}\d)/) || [""])[0].trim();
    const baseFileName = fileName.replace(/\.[^.]+$/, "").replace(/[-_ ]*(resume|cv)(?:\s*\(\d+\))?$/i, "").trim();
    const nameMatch = text.match(/\b([A-Z]{3,}(?:\s+[A-Z]){1,3})\b/);
    const name = nameMatch ? nameMatch[1] : baseFileName || "Uploaded Candidate";
    const locationMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+)\b/);
    const educationMatch = text.match(/Bachelor of Information Technology(?:\s+M\.?Kumarasamy College of Engineering)?/i)
      || text.match(/Bachelor of [A-Za-z ]+?(?=\s+(?:CGPA|PERCENTAGE|Higher Secondary|Secondary|S K I L L S|SKILLS)|$)/i);
    const skillParts = [
      text.match(/Programming\s*:\s*(.+?)(?=\s+Web\s*:|\s+Technologies\s*:|\s+Tools\s*:|\s+Bachelor|$)/i),
      text.match(/Web\s*:\s*(.+?)(?=\s+Technologies\s*:|\s+Tools\s*:|\s+Bachelor|$)/i),
      text.match(/Technologies\s*:\s*(.+?)(?=\s+Tools\s*:|\s+Bachelor|$)/i),
      text.match(/Tools\s*:\s*(.+?)(?=\s+Bachelor|$)/i)
    ].filter(Boolean).map(match => match[1].trim());

    return {
      candidateName: name,
      email,
      phone,
      location: locationMatch ? locationMatch[1].trim() : "Uploaded resume",
      degree: educationMatch ? educationMatch[0].trim() : "See uploaded resume",
      skills: skillParts.length ? skillParts.join(" | ") : "See uploaded resume"
    };
  }

  function createChunks(text) {
    const sections = text.split(/\n(?=\s*(?:[A-Z][A-Za-z &/]{2,45}|\d+[.)]\s*[^\n]{2,45})\s*\n?)/);
    const usable = sections.map(section => cleanText(section)).filter(section => section.length > 20);
    const sourceSections = usable.length > 1 ? usable : text.match(/[^.!?\n]+(?:[.!?][^.!?\n]+){0,5}/g) || [text];

    return sourceSections.map((content, index) => {
      const firstLine = content.split("\n")[0].trim();
      const section = firstLine.length <= 70 && !/[.!?]$/.test(firstLine)
        ? firstLine
        : `Resume section ${index + 1}`;
      const words = content.toLowerCase().match(/[a-z0-9+#.]+/g) || [];
      return {
        id: `uploaded-chunk-${index + 1}`,
        section,
        keywords: [...new Set(words.filter(word => word.length > 2))],
        content,
        source: "Uploaded Resume"
      };
    });
  }

  async function extractText(file) {
    const extension = file.name.toLowerCase().split(".").pop();
    if (extension === "txt" || extension === "md") return file.text();
    if (extension === "pdf") {
      if (!window.pdfjsLib) throw new Error("PDF support is still loading. Try again in a moment.");
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => item.str).join(" "));
      }
      return pages.join("\n\n");
    }
    if (extension === "docx") {
      if (!window.mammoth) throw new Error("DOCX support is still loading. Try again in a moment.");
      const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return result.value;
    }
    throw new Error("Use a TXT, PDF, or DOCX resume.");
  }

  function setStatus(message, isError) {
    const status = document.getElementById("resumeUploadStatus");
    if (!status) return;
    status.textContent = message;
    status.className = `text-xs ${isError ? "text-rose-300" : "text-emerald-300"}`;
  }

  function renderMetadata(metadata, fileName) {
    const name = metadata.candidateName || "Uploaded Candidate";
    document.querySelectorAll("[data-resume-name]").forEach(element => { element.textContent = name; });
    const title = document.querySelector("h1");
    if (title) title.textContent = `${name} • Resume RAG Assistant`;
    const fields = {
      resumeLocation: metadata.location,
      resumeEducation: metadata.degree,
      resumeEmail: metadata.email || "Not listed",
      resumePhone: metadata.phone || "Not listed",
      resumeSkills: metadata.skills
    };
    Object.keys(fields).forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = fields[id];
    });
    const fileLabel = document.getElementById("resumeFileName");
    if (fileLabel) fileLabel.textContent = fileName;
  }

  function activateResume(text, fileName, persist) {
    const cleaned = cleanText(text);
    if (cleaned.length < 40) throw new Error("The resume did not contain enough readable text.");
    const metadata = inferMetadata(cleaned, fileName);
    window.CURRENT_RESUME_CHUNKS = createChunks(cleaned);
    window.CURRENT_RESUME_METADATA = metadata;
    window.RESUME_IS_UPLOADED = true;
    renderMetadata(metadata, fileName);
    if (persist) localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: cleaned, fileName, metadata }));
    setStatus(`${window.CURRENT_RESUME_CHUNKS.length} searchable sections ready.`, false);
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setStatus("Resume must be smaller than 8 MB.", true);
      return;
    }
    setStatus("Extracting resume text...", false);
    try {
      activateResume(await extractText(file), file.name, true);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  function resetResume() {
    localStorage.removeItem(STORAGE_KEY);
    window.CURRENT_RESUME_CHUNKS = window.THANUSH_RESUME_CHUNKS || [];
    window.CURRENT_RESUME_METADATA = window.THANUSH_RESUME_METADATA || {};
    window.RESUME_IS_UPLOADED = false;
    setStatus("Using the bundled sample resume.", false);
    window.location.reload();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("resumeFileInput");
    const dropZone = document.getElementById("resumeDropZone");
    if (!input || !dropZone) return;
    input.addEventListener("change", event => handleFile(event.target.files[0]));
    ["dragenter", "dragover"].forEach(type => dropZone.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.add("border-cyan-400", "bg-cyan-500/10");
    }));
    ["dragleave", "drop"].forEach(type => dropZone.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.remove("border-cyan-400", "bg-cyan-500/10");
    }));
    dropZone.addEventListener("drop", event => handleFile(event.dataTransfer.files[0]));
    document.getElementById("resetResumeButton")?.addEventListener("click", resetResume);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const resume = JSON.parse(saved);
        activateResume(resume.text, resume.fileName, false);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  });

  window.ResumeUpload = { handleFile, activateResume };
})();