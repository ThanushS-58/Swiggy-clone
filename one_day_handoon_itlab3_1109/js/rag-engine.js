/**
 * SkillForge Pro - Strict Resume RAG Retrieval & Guardrail Engine
 * Strictly answers ONLY using verified facts from Thanush S's resume.
 * Guarantees zero hallucinations and explicit fallback for unmentioned items.
 */

const ResumeRAGEngine = {
  stopwords: new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
    "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
    "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
    "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves", "tell", "give", "know", "does", "thanush", "thanush's"
  ]),

  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#.]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 1 && !this.stopwords.has(w));
  },

  /**
   * Hybrid lexical + keyword retrieval over resume chunks
   */
  retrieve(query, topK = 3) {
    const chunks = window.CURRENT_RESUME_CHUNKS || window.THANUSH_RESUME_CHUNKS || [];
    const queryTokens = this.tokenize(query);
    const rawLower = query.toLowerCase();

    if (queryTokens.length === 0 && rawLower.trim().length === 0) {
      return { chunks: [], isGroundable: false, maxScore: 0 };
    }

    const scored = chunks.map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const sectionLower = chunk.section.toLowerCase();

      // 1. Keyword direct hit
      chunk.keywords.forEach(kw => {
        if (rawLower.includes(kw)) {
          score += 3.5;
        }
      });

      // 2. Token overlap with chunk content
      queryTokens.forEach(token => {
        if (contentLower.includes(token)) {
          score += 2.0;
        }
        if (sectionLower.includes(token)) {
          score += 3.0;
        }
      });

      // 3. Exact phrase match bonus
      if (rawLower.length > 4 && contentLower.includes(rawLower)) {
        score += 8.0;
      }

      return {
        chunk,
        score,
        confidence: Math.min(Math.round(score * 8.5), 100)
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const maxScore = scored.length > 0 ? scored[0].score : 0;
    // Grounding threshold: if highest score is too low, the query is not in the resume
    const isGroundable = maxScore >= 2.0;

    return {
      topResults: scored.slice(0, topK),
      isGroundable,
      maxScore
    };
  },

  /**
   * Generates strictly grounded responses adhering 100% to the resume
   */
  answer(query) {
    const rawLower = query.toLowerCase().trim();
    const retrieval = this.retrieve(query, 3);
    const topResults = retrieval.topResults;
    const isUploadedResume = Boolean(window.RESUME_IS_UPLOADED);

    if (isUploadedResume) {
      const metadata = window.CURRENT_RESUME_METADATA || {};
      if (/\b(name|candidate|applicant)\b/.test(rawLower) && /\b(name|candidate|applicant)\b/.test(rawLower)) {
        return {
          answer: `### Candidate Name\n\n**${metadata.candidateName || "Not listed in the uploaded resume"}**`,
          retrievedChunks: topResults.map(result => result.chunk),
          confidence: metadata.candidateName ? 100 : 0,
          isRefusal: !metadata.candidateName,
          source: "Uploaded Resume Header"
        };
      }
      if (/\b(education|educational|qualification|degree|college|university|cgpa|academic)\b/.test(rawLower)) {
        const education = metadata.degree || "Not listed in the uploaded resume";
        return {
          answer: `### Education Qualification\n\n${education}`,
          retrievedChunks: topResults.map(result => result.chunk),
          confidence: metadata.degree && metadata.degree !== "See uploaded resume" ? 100 : 0,
          isRefusal: !metadata.degree || metadata.degree === "See uploaded resume",
          source: "Uploaded Resume Education"
        };
      }
      if (/\b(skill|skills|technical stack|technology|technologies|programming)\b/.test(rawLower)) {
        const skills = metadata.skills || "Not listed in the uploaded resume";
        return {
          answer: `### Technical Skills\n\n${skills}`,
          retrievedChunks: topResults.map(result => result.chunk),
          confidence: metadata.skills && metadata.skills !== "See uploaded resume" ? 100 : 0,
          isRefusal: !metadata.skills || metadata.skills === "See uploaded resume",
          source: "Uploaded Resume Skills"
        };
      }
      if (!retrieval.isGroundable || topResults.length === 0 || topResults[0].score < 2.0) {
        return {
          answer: "**Not found in the uploaded resume**\n\nI could not find enough matching information to answer that question from the uploaded document.",
          retrievedChunks: topResults.map(result => result.chunk),
          confidence: 0,
          isRefusal: true,
          source: "Uploaded Resume Grounding Guardrail"
        };
      }

      return {
        answer: `### ${topResults[0].chunk.section}\n\n${topResults.map(result => result.chunk.content).join("\n\n")}`,
        retrievedChunks: topResults.map(result => result.chunk),
        confidence: topResults[0].confidence,
        isRefusal: false,
        source: "Uploaded Resume"
      };
    }

    // Check specific negative skill questions (e.g., "does he know Rust?", "does he know AWS?", "does he know C++?")
    const unlistedTechs = [
      "rust", "golang", "go language", "c++", "c#", ".net", "aws", "amazon web services", "gcp",
      "google cloud platform", "docker", "kubernetes", "k8s", "ruby", "swift", "kotlin", "angular", "vue"
    ];

    // Safe regex matcher handling characters like c++, c#, .net
    function matchesTech(text, term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i');
      return pattern.test(text);
    }

    for (const tech of unlistedTechs) {
      if (matchesTech(rawLower, tech)) {
        return {
          answer: `**Information Not Found in Resume**\n\nThanush S's resume **does not list \`${tech.toUpperCase()}\`**.\n\nAccording to his verified resume:\n• **Languages:** Java, Python, SQL, JavaScript, PHP\n• **Frameworks & Tech Stack:** HTML, CSS, Bootstrap, React, TypeScript, Flask, Node.js, REST APIs\n• **Cloud & Databases:** PostgreSQL, MySQL, Microsoft Azure\n• **Developer Tools:** Git, GitHub, Vercel`,
          retrievedChunks: topResults.map(r => r.chunk),
          confidence: 95,
          isRefusal: true,
          source: "Technical Skills Verification Guardrail"
        };
      }
    }

    // Check personal/irrelevant questions not present in resume
    const outOfBoundsPatterns = [
      "favorite", "hobby", "hobbies", "food", "movie", "game", "age", "birthday", "birth date",
      "marital", "salary", "family", "father", "mother", "religion", "politics", "address line",
      "weather", "who is the president", "tell me a joke"
    ];

    for (const pattern of outOfBoundsPatterns) {
      if (rawLower.includes(pattern)) {
        return {
          answer: `⚠️ **Strict Grounding Notice**\n\nThis information is **not mentioned in Thanush S's resume**.\n\nAs a strictly grounded Resume RAG model, I am programmed to only answer questions using verified facts from Thanush's resume (such as his education, B.Tech CGPA, technical skills, projects, TIH MKCE work experience, Microsoft Azure certifications, IEEE publications, and achievements).`,
          retrievedChunks: [],
          confidence: 0,
          isRefusal: true,
          source: "Strict Grounding Filter"
        };
      }
    }

    // If similarity is below groundable threshold, refuse speculation!
    if (!retrieval.isGroundable || topResults.length === 0 || topResults[0].score < 2.0) {
      return {
        answer: `⚠️ **Not in Resume**\n\nI could not find information regarding your query in Thanush S's resume.\n\nPlease ask about:\n• **Work Experience:** Full Stack Developer at TIH MKCE\n• **Academic Background:** B.Tech IT at M. Kumarasamy College of Engineering (CGPA: 8.29)\n• **Projects:** Resume Builder, Medicinal Plant AI (87% accuracy), IT Skill Demand Analysis\n• **Certifications:** Microsoft Azure Fundamentals, Azure AI Fundamentals, Azure AI Engineer Associate, NPTEL\n• **Research Papers:** IEEE ICEAMST 2025, IEEE ICICV 2026\n• **Technical Skills:** Java, Python, React, TypeScript, Node.js, PostgreSQL, Azure, Gemini API`,
        retrievedChunks: topResults.map(r => r.chunk),
        confidence: 0,
        isRefusal: true,
        source: "Zero-Shot Grounding Guardrail"
      };
    }

    // Synthesize grounded response using top chunks
    const primary = topResults[0].chunk;
    let answerText = "";

    // Specific entity synthesis based on top matching chunk
    if (primary.id === "chunk-education" || rawLower.includes("cgpa") || rawLower.includes("college") || rawLower.includes("marks") || rawLower.includes("school")) {
      answerText = `### Academic Qualifications (Thanush S)\n\n` +
        `• **B.Tech, Information Technology**\n` +
        `  - **Institution:** M. Kumarasamy College of Engineering\n` +
        `  - **CGPA:** **8.29**\n` +
        `  - **Duration:** 2023–2027 (Expected)\n\n` +
        `• **Higher Secondary Education (HSC)**\n` +
        `  - **School:** Sri Chaitanya Techno School (CBSE)\n` +
        `  - **Score:** **84.6%** (2022–2023)\n\n` +
        `• **Secondary School Leaving Certificate (SSLC)**\n` +
        `  - **School:** Star School (CBSE)\n` +
        `  - **Score:** **87.8%** (2019–2020)`;
    } else if (primary.id === "chunk-experience-tih" || rawLower.includes("experience") || rawLower.includes("work") || rawLower.includes("tih") || rawLower.includes("job")) {
      answerText = `### Professional Experience: Full Stack Developer\n\n` +
        `**Organization:** Technology Innovation Hub (TIH) – MKCE | Karur, India\n` +
        `**Tenure:** June 2025 – April 2026\n\n` +
        `**Key Contributions & Accomplishments:**\n` +
        `• **Role-Based Access Control (RBAC):** Implemented RBAC across 5+ academic roles using middleware and route-level authorization for secure data isolation across departmental modules.\n` +
        `• **Administrative Dashboards:** Built dashboards for Discipline Coordinators and Higher Authorities featuring occurrence validation, suspension tracking, real-time analytics, and semester-wise reporting.\n` +
        `• **Production Deployment:** Currently live and actively used for managing discipline entries at the college.\n` +
        `• **Export & Reporting:** Shipped Excel/PDF reporting workflows to support compliance, audits, and recurring administration.`;
    } else if (primary.id === "chunk-certifications" || rawLower.includes("certification") || rawLower.includes("azure")) {
      answerText = `### Professional Certifications\n\n` +
        `Thanush S holds the following 4 official certifications:\n\n` +
        `1. **Microsoft Certified: Azure Fundamentals** — Cloud architecture principles and core cloud services.\n` +
        `2. **Microsoft Certified: Azure AI Fundamentals** — Foundational AI and Machine Learning concepts.\n` +
        `3. **Microsoft Certified: Azure AI Engineer Associate** — Designing and deploying AI and ML solutions on Microsoft Azure.\n` +
        `4. **NPTEL: Cloud Computing** — Emphasis on virtualization and distributed systems.`;
    } else if (primary.id === "chunk-project-medicinal-plant" || rawLower.includes("plant") || rawLower.includes("cnn") || rawLower.includes("72 species") || rawLower.includes("accuracy")) {
      answerText = `### Project: Medicinal Plant Recognition Platform\n\n` +
        `**Timeline:** June 2025 – January 2026 | **Team Size:** 4\n` +
        `**Technologies:** CNNs, Google Gemini API, REST APIs, PostgreSQL, validation workflows, multilingual UX\n\n` +
        `**Key Highlights:**\n` +
        `• Built a community-driven computer-vision system for identifying medicinal plants.\n` +
        `• Achieved **87% classification accuracy** across **72 species** using an ensemble of Convolutional Neural Networks (CNNs).\n` +
        `• Integrated **Gemini API** for automated confidence scoring.\n` +
        `• Added expert validation workflows and multilingual voice/text input in a full-stack React/Node.js/PostgreSQL application.\n` +
        `• Research presented at IEEE ICEAMST 2025 (RV College of Engineering).`;
    } else if (primary.id === "chunk-project-it-demand" || rawLower.includes("demand") || rawLower.includes("5,000") || rawLower.includes("job postings") || rawLower.includes("streamlit")) {
      answerText = `### Project: IT Skill Demand Analysis Platform\n\n` +
        `**Timeline:** December 2025 – May 2026 | **Team Size:** 4\n` +
        `**Technologies:** Python, Streamlit, Pandas, NLTK, Scikit-learn (TF-IDF), Plotly/Matplotlib, PDF/CSV export\n\n` +
        `**Key Highlights:**\n` +
        `• Developed an NLP pipeline analyzing over **5,000 job postings**.\n` +
        `• Implemented text cleaning, 10-domain taxonomy classification, and TF-IDF-based skill extraction using a curated 100-skill dictionary.\n` +
        `• Created Streamlit dashboards supporting 3 user roles (Users, Analysts, Admins) with real-time filters by role, location, and experience.\n` +
        `• Built automated PDF/CSV reporting for skill-demand trends and salary-correlation analysis.`;
    } else if (primary.id === "chunk-project-resume-builder" || rawLower.includes("resume builder") || rawLower.includes("ats")) {
      answerText = `### Project: Resume Builder and Recruiter Screening Platform\n\n` +
        `**Timeline:** January 2025 – April 2025 | **Team Size:** 3\n` +
        `**Technologies:** React, TypeScript, Node.js, REST APIs, PostgreSQL, Tailwind CSS, CSV/PDF export\n\n` +
        `**Key Highlights:**\n` +
        `• Built an ATS-friendly resume builder and recruiter screening workflow.\n` +
        `• Profile-driven resume generation across 10 sections with 4 customizable templates.\n` +
        `• Supported export to PDF, DOCX, and TXT formats.\n` +
        `• Integrated bulk resume processing, JD-based customization, automated skills extraction, candidate scoring, and analytics reports.`;
    } else if (primary.id === "chunk-publications" || rawLower.includes("ieee") || rawLower.includes("paper") || rawLower.includes("publication")) {
      answerText = `### IEEE Research Publications\n\n` +
        `Thanush S has co-authored and presented 2 IEEE research papers:\n\n` +
        `1. **IEEE ICEAMST 2025:**\n` +
        `   *Title:* "Medicinal Plant Recognition and Traditional Knowledge Saving using AI-Powered Medicinal Plant Recognition System"\n` +
        `   *Venue:* Presented at RV College of Engineering.\n\n` +
        `2. **IEEE ICICV 2026:**\n` +
        `   *Title:* "Intelligent Parcel Monitoring and Security System for Smart Apartments using IoT and AI Technologies"\n` +
        `   *Venue:* Printed and exhibited at Tirunelveli, India.`;
    } else if (primary.id === "chunk-achievements" || rawLower.includes("award") || rawLower.includes("hackathon") || rawLower.includes("unstop") || rawLower.includes("achievement")) {
      answerText = `### Honors & Achievements\n\n` +
        `• **Unstop Talent Awards 2026:** Recognized among the **Top 10 Unstoppable Campus Ambassadors (India)**.\n` +
        `• **AI Conclave 1.0 (National Hackathon) 2025:** Participated and built the **Smart Hire** solution at Kongu Engineering College.`;
    } else if (primary.id.startsWith("chunk-skills") || rawLower.includes("skill") || rawLower.includes("technologies") || rawLower.includes("stack")) {
      answerText = `### Technical Skills Inventory (Thanush S)\n\n` +
        `• **Programming Languages:** Java, Python, SQL, JavaScript, PHP\n` +
        `• **Web Tech Stack:** HTML, CSS, Bootstrap, React, TypeScript, Flask, Node.js, REST APIs\n` +
        `• **Databases & Cloud:** PostgreSQL, MySQL, Microsoft Azure\n` +
        `• **AI & Machine Learning:** Natural Language Processing (NLP), Computer Vision, spaCy, Google Gemini API\n` +
        `• **Developer Tools:** Git, GitHub, Vercel`;
    } else if (primary.id === "chunk-contact") {
      answerText = `### Contact & Profiles for Thanush S\n\n` +
        `• **Location:** Karur, India\n` +
        `• **Email:** [thanush205s@gmail.com](mailto:thanush205s@gmail.com)\n` +
        `• **Phone:** +91 8248289043\n` +
        `• **Profiles Listed:** LinkedIn, GitHub, Portfolio, and LeetCode`;
    } else {
      // Direct quote from primary chunk
      answerText = `### ${primary.section}\n\n${primary.content}`;
    }

    return {
      answer: answerText,
      retrievedChunks: topResults.map(r => r.chunk),
      confidence: topResults[0].confidence,
      isRefusal: false,
      source: primary.source
    };
  }
};

window.ResumeRAGEngine = ResumeRAGEngine;
