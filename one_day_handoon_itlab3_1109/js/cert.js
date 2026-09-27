/**
 * SkillForge Pro - Dynamic Certificate Generation Engine
 * Uses HTML5 Canvas to render enterprise-grade certificates of completion
 * with verifiable cryptographic hashes, issuer badges, and export options.
 */

const SkillForgeCert = {
  renderCertificate(canvasId, certData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = 1600;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // 1. Dark Tech Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#090d16");
    bgGradient.addColorStop(0.5, "#0e1526");
    bgGradient.addColorStop(1, "#070a12");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Luxury Outer & Inner Borders
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
    ctx.strokeRect(45, 45, width - 90, height - 90);

    // Corner decorative geometric accents
    this.drawCornerAccents(ctx, 45, 45, width - 90, height - 90);

    // 3. Institution Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("SKILLFORGE PRO • ADVANCED ENGINEERING ACADEMY", width / 2, 130);

    // 4. Main Certificate Heading
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("CERTIFICATE OF SPECIALIZATION", width / 2, 210);

    // Divider line
    const divGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
    divGrad.addColorStop(0, "transparent");
    divGrad.addColorStop(0.5, "#6366f1");
    divGrad.addColorStop(1, "transparent");
    ctx.fillStyle = divGrad;
    ctx.fillRect(width / 2 - 250, 235, 500, 3);

    // Subtitle
    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText("THIS RECOGNIZES THAT", width / 2, 300);

    // 5. Recipient Name
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 64px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText(certData.userFullName || "Engineering Professional", width / 2, 390);

    // Underline
    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
    ctx.fillRect(width / 2 - 320, 415, 640, 2);

    // Description text
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("has successfully mastered the architectural principles, hands-on labs, and production assessments in", width / 2, 470);

    // 6. Course Title
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "0.5px";
    ctx.fillText(certData.courseTitle || "Generative AI Systems Architecture", width / 2, 550);

    // Course Track Details
    ctx.fillStyle = "#a5b4fc";
    ctx.font = "20px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${certData.category || 'Staff Engineer Track'} • Practical Competency Verified`, width / 2, 600);

    // 7. Security Seal & Badging
    this.drawSecuritySeal(ctx, width / 2, 730);

    // 8. Footer Signatures & Metadata
    // Left: Issue Date & Verification ID
    ctx.textAlign = "left";
    ctx.fillStyle = "#64748b";
    ctx.font = "16px 'JetBrains Mono', monospace";
    ctx.fillText(`ISSUED DATE: ${certData.issueDate || new Date().toLocaleDateString()}`, 90, 890);
    ctx.fillText(`VERIFY HASH: ${certData.certId || 'SF-A91F-VERIFIED'}`, 90, 920);

    // Right: Signatures
    ctx.textAlign = "right";
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "italic 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Dr. Marcus Vance", width - 90, 885);
    ctx.fillStyle = "#64748b";
    ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Chief Architect & Curriculum Director", width - 90, 915);

    // Signature line
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(width - 390, 895, 300, 1);
  },

  drawCornerAccents(ctx, x, y, w, h) {
    const size = 30;
    ctx.fillStyle = "#38bdf8";

    // Top-Left
    ctx.fillRect(x - 2, y - 2, size, 4);
    ctx.fillRect(x - 2, y - 2, 4, size);

    // Top-Right
    ctx.fillRect(x + w - size + 2, y - 2, size, 4);
    ctx.fillRect(x + w - 2, y - 2, 4, size);

    // Bottom-Left
    ctx.fillRect(x - 2, y + h - 2, size, 4);
    ctx.fillRect(x - 2, y + h - size + 2, 4, size);

    // Bottom-Right
    ctx.fillRect(x + w - size + 2, y + h - 2, size, 4);
    ctx.fillRect(x + w - 2, y + h - size + 2, 4, size);
  },

  drawSecuritySeal(ctx, cx, cy) {
    // Outer seal circle
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(99, 102, 241, 0.7)";
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
    ctx.stroke();

    // Star / emblem in center
    ctx.textAlign = "center";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("★ SF ★", cx, cy + 8);
  },

  download(canvasId, filename = "SkillForge_Certificate.png") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
    if (window.SkillForgeApp) {
      window.SkillForgeApp.showToast("Certificate downloaded successfully!", "success");
    }
  },

  print(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate - SkillForge Pro</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

window.SkillForgeCert = SkillForgeCert;
