#!/usr/bin/env python3
"""
SkillForge Pro - Production Resume RAG Engine
Candidate: Thanush S (B.Tech IT, M. Kumarasamy College of Engineering, CGPA: 8.29)
Strict Grounding Constraint: Responds ONLY with verified facts from the resume. Zero hallucination.
"""

import math
import re
import sys
from typing import List, Dict, Any

# Ensure stdout uses UTF-8 or ASCII safe fallback
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ==============================================================================
# 1. SEMANTIC RESUME CHUNKS
# ==============================================================================
RESUME_CHUNKS = [
    {
        "id": "chunk_contact",
        "section": "Contact & Profile",
        "keywords": ["name", "contact", "email", "phone", "location", "address", "linkedin", "github", "portfolio", "leetcode", "karur"],
        "content": (
            "Candidate: Thanush S. Location: Karur, India. "
            "Email: thanush205s@gmail.com. Phone: +91 8248289043. "
            "Profiles: LinkedIn, GitHub, Portfolio, LeetCode."
        )
    },
    {
        "id": "chunk_summary",
        "section": "Professional Summary",
        "keywords": ["summary", "about", "profile", "objective", "role", "b.tech", "hands-on"],
        "content": (
            "Final year B.Tech Information Technology student with hands on experience in developing web projects "
            "and AI based solutions for real world problems. Interested in building practical, user focused software "
            "and continuously improving through academic projects, internships, and collaborative development. "
            "Eager to apply technical and problem solving skills in a Software Engineering role."
        )
    },
    {
        "id": "chunk_area_of_interest",
        "section": "Area of Interest",
        "keywords": ["interest", "domain", "area", "focus", "cloud", "full-stack", "machine learning", "ai"],
        "content": "Area of Interest: Full-Stack Development, AI and ML Applications, Cloud Computing."
    },
    {
        "id": "chunk_skills_languages",
        "section": "Technical Skills - Languages",
        "keywords": ["language", "languages", "java", "python", "sql", "javascript", "php", "programming", "coding"],
        "content": "Programming Languages: Java, Python, SQL, JavaScript, PHP."
    },
    {
        "id": "chunk_skills_frameworks",
        "section": "Technical Skills - Tech Stack & Frameworks",
        "keywords": ["tech stack", "framework", "html", "css", "bootstrap", "react", "typescript", "flask", "node.js", "rest apis"],
        "content": "Tech Stack: HTML, CSS, Bootstrap, React, TypeScript, Flask, Node.js, REST APIs."
    },
    {
        "id": "chunk_skills_cloud_db",
        "section": "Technical Skills - Databases & Cloud",
        "keywords": ["database", "databases", "cloud", "postgresql", "mysql", "azure", "microsoft azure", "tools", "git", "github", "vercel"],
        "content": "Databases and Cloud: PostgreSQL, MySQL, Microsoft Azure. Developer Tools: Git, GitHub, Vercel."
    },
    {
        "id": "chunk_skills_ai_ml",
        "section": "Technical Skills - AI and ML",
        "keywords": ["ai", "ml", "machine learning", "nlp", "computer vision", "spacy", "gemini api"],
        "content": "AI and ML: Natural Language Processing (NLP), Computer Vision, spaCy, Gemini API."
    },
    {
        "id": "chunk_experience_tih",
        "section": "Work Experience - Full Stack Developer",
        "keywords": ["experience", "work", "job", "internship", "developer", "tih", "technology innovation hub", "mkce", "karur", "rbac", "discipline", "dashboard", "live"],
        "content": (
            "Full Stack Developer at Technology Innovation Hub (TIH) – MKCE, Karur, India (Jun 2025–Apr 2026).\n"
            "• Implemented role-based access control (RBAC) across five or more academic roles using middleware and route-level authorization to enforce secure data isolation across departmental modules.\n"
            "• Delivered administrative dashboards for Discipline Coordinators and Higher Authorities with occurrence validation, suspension tracking, real-time analytics, and semester-wise reporting.\n"
            "• Currently live and actively used for managing discipline entries at the college.\n"
            "• Shipped export and reporting workflows (Excel/PDF) to support compliance, audits, and recurring administrative reporting."
        )
    },
    {
        "id": "chunk_project_resume_builder",
        "section": "Project - Resume Builder and Recruiter Screening Platform",
        "keywords": ["resume builder", "recruiter", "screening", "ats", "templates", "docx", "pdf", "txt", "scoring", "react", "typescript", "node.js", "postgresql", "tailwind"],
        "content": (
            "Resume Builder and Recruiter Screening Platform (Jan 2025 – Apr 2025).\n"
            "Built an ATS-friendly resume builder and recruiter screening workflow with profile-driven generation (10 sections), "
            "4 templates, and export to PDF/DOCX/TXT. Added bulk resume processing, JD-based customization, skills extraction, "
            "candidate scoring, and analytics-driven reports.\n"
            "Technologies: React, TypeScript, Node.js, REST APIs, PostgreSQL, Tailwind CSS, CSV/PDF export. Team Size: 3."
        )
    },
    {
        "id": "chunk_project_medicinal_plant",
        "section": "Project - Medicinal Plant Recognition Platform",
        "keywords": ["medicinal", "plant", "recognition", "computer vision", "cnn", "cnns", "accuracy", "72 species", "87 percent", "87%", "gemini api", "multilingual", "voice"],
        "content": (
            "Medicinal Plant Recognition Platform (Jun 2025 – Jan 2026).\n"
            "Built a community-driven computer-vision system for medicinal plant identification; achieved 87 percent classification accuracy "
            "across 72 species using an ensemble of CNNs. Integrated Gemini API for confidence scoring, enabled expert validation, "
            "and added multilingual voice/text input in a full-stack React/Node/PostgreSQL app.\n"
            "Technologies: CNNs, Gemini API, REST APIs, PostgreSQL, validation workflows, multilingual UX. Team Size: 4."
        )
    },
    {
        "id": "chunk_project_it_demand",
        "section": "Project - IT Skill Demand Analysis Platform",
        "keywords": ["it skill", "demand", "analysis", "nlp", "job postings", "5000", "5,000", "tf-idf", "scikit-learn", "nltk", "streamlit", "pandas", "salary", "correlation"],
        "content": (
            "IT Skill Demand Analysis Platform (Dec 2025 – May 2026).\n"
            "Developed an NLP pipeline over 5,000 job postings: cleaning, 10-domain taxonomy classification, and TF-IDF-based skill extraction "
            "using a 100-skill dictionary. Built Streamlit dashboards for 3 roles (Users/Analysts/Admins) with real-time filters "
            "(role/location/experience) and automated PDF/CSV reporting for skill-demand and salary-correlation analysis.\n"
            "Technologies: Python, Streamlit, Pandas, NLTK, Scikit-learn (TF-IDF), Plotly/Matplotlib, PDF/CSV export. Team Size: 4."
        )
    },
    {
        "id": "chunk_education",
        "section": "Education & Academic Qualifications",
        "keywords": ["education", "college", "degree", "b.tech", "cgpa", "school", "hsc", "sslc", "cbse", "kumarasamy", "chaitanya", "percentage", "marks"],
        "content": (
            "Education:\n"
            "• B.Tech, Information Technology at M. Kumarasamy College of Engineering | CGPA: 8.29 (2023–2027 Expected)\n"
            "• Higher Secondary Education (HSC) at Sri Chaitanya Techno School (CBSE) | 84.6% (2022–2023)\n"
            "• Secondary School Leaving Certificate (SSLC) at Star School (CBSE) | 87.8% (2019–2020)"
        )
    },
    {
        "id": "chunk_certifications",
        "section": "Professional Certifications",
        "keywords": ["certification", "certifications", "certified", "azure", "microsoft", "nptel", "fundamentals", "ai engineer", "cloud computing"],
        "content": (
            "Certifications:\n"
            "• Certified in Azure Fundamentals by Microsoft, with knowledge of cloud architecture and core services\n"
            "• Certified in Azure AI Fundamentals by Microsoft, demonstrating foundational AI and ML concepts\n"
            "• Certified in Azure AI Engineer Associate by Microsoft, for designing and deploying AI and ML solutions\n"
            "• Certified in Cloud Computing by NPTEL, with emphasis on virtualization and distributed systems."
        )
    },
    {
        "id": "chunk_publications",
        "section": "Research Publications (IEEE)",
        "keywords": ["publication", "publications", "ieee", "paper", "research", "iceamst", "icicv", "rv college", "tirunelveli", "smart apartments", "iot"],
        "content": (
            "Research Publications:\n"
            "• IEEE ICEAMST 2025: Released and presented the IEEE research paper 'Medicinal Plant Recognition and Traditional Knowledge Saving using AI-Powered Medicinal Plant Recognition System' at RV College of Engineering.\n"
            "• IEEE ICICV 2026: Printed and exhibited the research paper 'Intelligent Parcel Monitoring and Security System for Smart Apartments using IoT and AI Technologies' at Tirunelveli, India."
        )
    },
    {
        "id": "chunk_achievements",
        "section": "Honors & Achievements",
        "keywords": ["achievement", "achievements", "awards", "award", "unstop", "campus ambassador", "hackathon", "ai conclave", "smart hire", "kongu"],
        "content": (
            "Achievements:\n"
            "• Unstop Talent Awards 2026: Top 10 Unstoppable Campus Ambassador (India).\n"
            "• AI Conclave 1.0 (National Hackathon) 2025: Participated and built Smart Hire at Kongu Engineering College."
        )
    }
]

# Stopwords for tokenization
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "could",
    "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has",
    "have", "having", "he", "her", "here", "hers", "him", "his", "how", "i", "if", "in", "into", "is",
    "it", "its", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "our", "out", "over", "own", "same", "she", "should", "so", "some", "such",
    "than", "that", "the", "their", "theirs", "them", "then", "there", "these", "they", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
    "which", "while", "who", "whom", "why", "with", "would", "you", "your", "thanush"
}

# ==============================================================================
# 2. STRICT GUARDRAIL & RETRIEVAL ENGINE
# ==============================================================================
class ResumeRAGEngine:
    def __init__(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        self.unlisted_techs = [
            "rust", "golang", "c++", "c#", ".net", "aws", "gcp", "docker", "kubernetes",
            "k8s", "ruby", "swift", "kotlin", "angular", "vue"
        ]
        self.out_of_bounds = [
            "favorite", "hobby", "hobbies", "food", "movie", "game", "age", "birthday",
            "salary", "father", "mother", "religion", "politics", "marital"
        ]

    def tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9+#.]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 1 and w not in STOPWORDS]

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        tokens = self.tokenize(query)
        q_lower = query.lower()

        scored = []
        for chunk in self.chunks:
            score = 0.0
            content_lower = chunk["content"].lower()

            # Keyword matching
            for kw in chunk["keywords"]:
                if kw in q_lower:
                    score += 4.0

            # Token overlap
            for token in tokens:
                if token in content_lower:
                    score += 2.0

            # Exact phrase match bonus
            if len(q_lower) > 5 and q_lower in content_lower:
                score += 10.0

            scored.append({"chunk": chunk, "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return [s for s in scored[:top_k] if s["score"] > 0]

    def query(self, question: str) -> Dict[str, Any]:
        q_lower = question.lower()

        # Guardrail 1: Check unlisted technologies
        for tech in self.unlisted_techs:
            pattern = r"(?:^|[^a-zA-Z0-9#+])" + re.escape(tech) + r"(?:[^a-zA-Z0-9#+]|$)"
            if re.search(pattern, q_lower):
                return {
                    "answer": (
                        f"Information Not Found in Resume:\n"
                        f"Thanush S's resume does NOT list '{tech.upper()}'.\n\n"
                        f"Verified skills in his resume:\n"
                        f"• Languages: Java, Python, SQL, JavaScript, PHP\n"
                        f"• Tech Stack: HTML, CSS, Bootstrap, React, TypeScript, Flask, Node.js, REST APIs\n"
                        f"• Cloud/Databases: PostgreSQL, MySQL, Microsoft Azure\n"
                        f"• Developer Tools: Git, GitHub, Vercel"
                    ),
                    "grounded": True,
                    "retrieved_section": "Skills Verification Guardrail"
                }

        # Guardrail 2: Check out-of-bounds / personal queries
        for oob in self.out_of_bounds:
            if oob in q_lower:
                return {
                    "answer": (
                        "⚠️ Strict Grounding Notice:\n"
                        "This information is NOT mentioned in Thanush S's resume.\n"
                        "As a strictly grounded RAG model, I only answer questions using verified facts "
                        "from his resume (Education, CGPA, Technical Skills, Projects, Work Experience at TIH MKCE, "
                        "Microsoft Azure Certifications, and IEEE Publications)."
                    ),
                    "grounded": True,
                    "retrieved_section": "Out-of-Bounds Guardrail"
                }

        # Retrieval step
        results = self.retrieve(question, top_k=2)
        if not results or results[0]["score"] < 2.0:
            return {
                "answer": (
                    "⚠️ Information Not in Resume:\n"
                    "I could not find information regarding your query in Thanush S's resume.\n"
                    "Please ask about his Education (CGPA: 8.29), TIH MKCE Full Stack Experience, "
                    "Projects (Medicinal Plant AI, Resume Builder, IT Demand NLP), Azure Certifications, "
                    "or IEEE Research Papers."
                ),
                "grounded": True,
                "retrieved_section": "Zero-Shot Grounding Fallback"
            }

        top_chunk = results[0]["chunk"]
        return {
            "answer": f"[{top_chunk['section']}]\n{top_chunk['content']}",
            "grounded": True,
            "retrieved_section": top_chunk["section"],
            "chunk_id": top_chunk["id"]
        }


# ==============================================================================
# 3. CLI DEMONSTRATION & TEST HARNESS
# ==============================================================================
if __name__ == "__main__":
    engine = ResumeRAGEngine(RESUME_CHUNKS)

    print("=================================================================")
    print("  Thanush S - Strict Resume RAG Engine (Zero Hallucination)")
    print("=================================================================\n")

    test_queries = [
        "What is his B.Tech CGPA and college name?",
        "What certifications does he hold?",
        "Explain his role and work at TIH MKCE",
        "What was the accuracy of the Medicinal Plant Recognition system?",
        "What IEEE papers has he published?",
        "Does he know Rust or Docker?", # Out-of-bounds tech test
        "What is his favorite video game?" # Personal unlisted test
    ]

    for q in test_queries:
        print(f"Q: {q}")
        res = engine.query(q)
        print(f"A:\n{res['answer']}")
        print(f"-> Source: {res['retrieved_section']}")
        print("-" * 65 + "\n")
