
import { jsPDF } from "jspdf";
import { ResumeData, TemplateType } from "../types";

export const generateResumePDF = (data: ResumeData, template: TemplateType) => {
  const doc = new jsPDF();
  
  // Enforce ATS template for strict exports or fallback
  // If 'ats' is passed, use the strict function.
  if (template === 'ats') {
    generateATSTemplate(doc, data);
  } else {
    // For now, mapping all others to ATS if strictness is required, or fallback to simple
    // But keeping existing logic for "Builder" if reused elsewhere. 
    // Given the prompt "ATS-safe format only" for the export flow, we prioritize that.
    if (template === 'modern') generateModernTemplate(doc, data);
    else if (template === 'minimalist') generateMinimalistTemplate(doc, data);
    else if (template === 'creative') generateCreativeTemplate(doc, data);
    else generateATSTemplate(doc, data);
  }

  const suffix = 'Optimized';
  doc.save(`${data.fullName.replace(/\s+/g, '_')}_${suffix}.pdf`);
};

// --- Template 0: Hardcore ATS (Strict single column, Times New Roman) ---
const generateATSTemplate = (doc: jsPDF, data: ResumeData) => {
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = 20;

  // Font Settings - Times New Roman is the safest web-safe font for ATS
  doc.setFont("times", "roman");
  doc.setTextColor(0, 0, 0); // Strictly black

  // --- NAME ---
  doc.setFontSize(16);
  doc.setFont("times", "bold");
  doc.text(data.fullName.toUpperCase(), pageWidth / 2, cursorY, { align: "center" });
  cursorY += 6;

  // --- CONTACT ---
  doc.setFontSize(10);
  doc.setFont("times", "roman");
  const contactParts = [data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean);
  const contactLine = contactParts.join(" | ");
  doc.text(contactLine, pageWidth / 2, cursorY, { align: "center" });
  cursorY += 10;

  // --- HELPER FUNCTIONS ---
  const addFooter = () => {
     doc.setFontSize(8);
     doc.setTextColor(150, 150, 150);
     doc.text("Optimized for ATS parsing by StackCV", pageWidth / 2, pageHeight - 10, { align: 'center' });
     doc.setTextColor(0, 0, 0); // Reset
  };

  const addSectionHeader = (title: string) => {
    // Check space before adding header
    if (cursorY > 270) { 
        addFooter();
        doc.addPage(); 
        cursorY = 20; 
    }
    
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), margin, cursorY);
    cursorY += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY); // Simple horizontal rule
    cursorY += 5;
  };

  const checkPageBreak = (heightNeeded: number = 10) => {
     if (cursorY + heightNeeded > 270) {
       addFooter();
       doc.addPage();
       cursorY = 20;
     }
  };

  // --- SUMMARY ---
  if (data.summary) {
    addSectionHeader("Professional Summary");
    doc.setFont("times", "roman");
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
    checkPageBreak(summaryLines.length * 5);
    doc.text(summaryLines, margin, cursorY);
    cursorY += (summaryLines.length * 5) + 5;
  }

  // --- SKILLS ---
  if (data.skills && data.skills.length > 0) {
    addSectionHeader("Technical Skills");
    doc.setFont("times", "roman");
    doc.setFontSize(10);
    const skillsText = data.skills.join(", ");
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    checkPageBreak(skillLines.length * 5);
    doc.text(skillLines, margin, cursorY);
    cursorY += (skillLines.length * 5) + 5;
  }

  // --- EXPERIENCE ---
  if (data.experience && data.experience.length > 0) {
    addSectionHeader("Professional Experience");
    
    data.experience.forEach(exp => {
      checkPageBreak(20); // Check for header + 1-2 lines space
      
      // Line 1: Role and Date
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.text(exp.role, margin, cursorY);
      
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(exp.duration, pageWidth - margin, cursorY, { align: "right" });
      cursorY += 5;

      // Line 2: Company
      doc.setFont("times", "bold"); 
      doc.text(exp.company, margin, cursorY);
      cursorY += 6;

      // Bullets
      doc.setFont("times", "normal");
      exp.points.forEach(point => {
        const bullet = `• ${point}`;
        const lines = doc.splitTextToSize(bullet, contentWidth - 5);
        checkPageBreak(lines.length * 5);
        doc.text(lines, margin + 5, cursorY);
        cursorY += (lines.length * 5);
      });
      cursorY += 4; // Spacing between jobs
    });
  }

  // --- EDUCATION ---
  if (data.education && data.education.length > 0) {
    addSectionHeader("Education");
    data.education.forEach(edu => {
      checkPageBreak(15);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.text(edu.school, margin, cursorY);
      
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(edu.year, pageWidth - margin, cursorY, { align: "right" });
      cursorY += 5;
      
      doc.setFont("times", "italic");
      doc.text(edu.degree, margin, cursorY);
      cursorY += 8;
    });
  }

  // --- PROJECTS ---
  if (data.projects && data.projects.length > 0) {
    addSectionHeader("Projects");
    data.projects.forEach(proj => {
      checkPageBreak(15);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.text(proj.name, margin, cursorY);
      cursorY += 5;
      
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(proj.description, contentWidth);
      doc.text(descLines, margin, cursorY);
      cursorY += (descLines.length * 5) + 4;
    });
  }
  
  // Final Footer
  addFooter();
};

const generateModernTemplate = (doc: jsPDF, data: ResumeData) => {
  // Keeping existing modern logic but not used for Strict ATS Rewrite flow
  // ... (Same as original file for legacy support if needed) ...
   const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const leftColWidth = 60;
  
  // Sidebar Background
  doc.setFillColor(245, 247, 250); // Light gray-blue
  doc.rect(0, 0, leftColWidth + 20, 297, 'F');

  // Name & Header (Spanning full width on top usually, but let's do sidebar style)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text(data.fullName.toUpperCase(), margin, 30);

  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  doc.setFont("helvetica", "normal");
  let contactY = 40;
  
  // Left Column Content (Contact, Skills, Education)
  if (data.email) { doc.text(data.email, margin, contactY); contactY += 5; }
  if (data.phone) { doc.text(data.phone, margin, contactY); contactY += 5; }
  if (data.location) { doc.text(data.location, margin, contactY); contactY += 5; }
  if (data.linkedin) { doc.text("LinkedIn Profile", margin, contactY); contactY += 5; }
  
  contactY += 10;
  
  // Skills
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(45, 136, 255); // Blue
  doc.text("SKILLS", margin, contactY);
  contactY += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  data.skills.forEach(skill => {
    doc.text(`• ${skill}`, margin, contactY);
    contactY += 5;
  });

  contactY += 10;

  // Education
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(45, 136, 255);
  doc.text("EDUCATION", margin, contactY);
  contactY += 6;

  data.education.forEach(edu => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    const splitSchool = doc.splitTextToSize(edu.school, leftColWidth);
    doc.text(splitSchool, margin, contactY);
    contactY += (splitSchool.length * 4);
    
    doc.setFont("helvetica", "normal");
    doc.text(edu.degree, margin, contactY);
    contactY += 4;
    doc.setTextColor(100, 100, 100);
    doc.text(edu.year, margin, contactY);
    contactY += 8;
  });

  // Right Column (Summary, Experience)
  const rightX = leftColWidth + 30;
  const rightWidth = pageWidth - rightX - margin;
  let cursorY = 40;

  // Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("PROFESSIONAL SUMMARY", rightX, cursorY);
  cursorY += 7;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const splitSummary = doc.splitTextToSize(data.summary, rightWidth);
  doc.text(splitSummary, rightX, cursorY);
  cursorY += (splitSummary.length * 5) + 10;

  // Experience
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("WORK EXPERIENCE", rightX, cursorY);
  cursorY += 7;

  data.experience.forEach(exp => {
    // Role & Company
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(exp.role, rightX, cursorY);
    
    const companyWidth = doc.getTextWidth(exp.role);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(` at ${exp.company}`, rightX + companyWidth, cursorY);
    
    // Date
    doc.setFontSize(9);
    doc.text(exp.duration, pageWidth - margin - doc.getTextWidth(exp.duration), cursorY);
    
    cursorY += 6;

    // Bullets
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    exp.points.forEach(point => {
      const bullet = `• ${point}`;
      const splitPoint = doc.splitTextToSize(bullet, rightWidth);
      doc.text(splitPoint, rightX, cursorY);
      cursorY += (splitPoint.length * 5);
    });
    cursorY += 6;
  });

  // Projects if space
  if (data.projects && data.projects.length > 0 && cursorY < 250) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text("PROJECTS", rightX, cursorY);
    cursorY += 7;

    data.projects.forEach(proj => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(proj.name, rightX, cursorY);
      cursorY += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const splitDesc = doc.splitTextToSize(proj.description, rightWidth);
      doc.text(splitDesc, rightX, cursorY);
      cursorY += (splitDesc.length * 5) + 5;
    });
  }
};

const generateMinimalistTemplate = (doc: jsPDF, data: ResumeData) => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let cursorY = 20;

  // Header Centered
  doc.setFont("times", "roman");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(data.fullName, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 8;

  doc.setFontSize(10);
  const contactInfo = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join("  |  ");
  doc.text(contactInfo, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 15;

  // Divider
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // Summary
  if (data.summary) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("SUMMARY", margin, cursorY);
    cursorY += 5;
    
    doc.setFont("times", "roman");
    doc.setFontSize(10);
    const splitSum = doc.splitTextToSize(data.summary, pageWidth - (margin * 2));
    doc.text(splitSum, margin, cursorY);
    cursorY += (splitSum.length * 5) + 8;
  }

  // Experience
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("EXPERIENCE", margin, cursorY);
  cursorY += 5;
  doc.line(margin, cursorY - 1, pageWidth - margin, cursorY - 1); // Subline
  cursorY += 5;

  data.experience.forEach(exp => {
    // Top line: Role ....... Date
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(exp.role, margin, cursorY);
    
    doc.setFont("times", "italic");
    doc.text(exp.duration, pageWidth - margin, cursorY, { align: 'right' });
    
    cursorY += 5;
    
    // Company
    doc.setFont("times", "roman"); 
    doc.setFontSize(11);
    doc.text(exp.company, margin, cursorY);
    cursorY += 6;

    // Bullets
    doc.setFontSize(10);
    exp.points.forEach(point => {
      const bullet = `• ${point}`;
      const splitPoint = doc.splitTextToSize(bullet, pageWidth - (margin * 2) - 5);
      doc.text(splitPoint, margin + 5, cursorY);
      cursorY += (splitPoint.length * 5);
    });
    cursorY += 6;
  });

  // Skills
  if (cursorY < 250) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("SKILLS", margin, cursorY);
    cursorY += 6;
    doc.line(margin, cursorY - 1, pageWidth - margin, cursorY - 1);
    cursorY += 5;

    doc.setFont("times", "roman");
    doc.setFontSize(10);
    const skillsText = data.skills.join(" • ");
    const splitSkills = doc.splitTextToSize(skillsText, pageWidth - (margin * 2));
    doc.text(splitSkills, margin, cursorY);
  }
};

const generateCreativeTemplate = (doc: jsPDF, data: ResumeData) => {
   const pageWidth = doc.internal.pageSize.width;
  let cursorY = 0;
  const margin = 20;

  // Header Background
  doc.setFillColor(45, 212, 191); // Mint-Teal
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  cursorY = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(data.fullName, margin, 32);

  cursorY = 60;
  
  // Contact Row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const contact = [data.email, data.phone, data.location].filter(Boolean).join("  •  ");
  doc.text(contact, margin, cursorY);
  cursorY += 15;

  // Two Column Layout
  const col1X = margin;
  const col1W = (pageWidth - (margin * 3)) * 0.65;
  const col2X = margin + col1W + margin;
  const col2W = (pageWidth - (margin * 3)) * 0.35;

  // Main Column (Experience)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(45, 212, 191); // Accent color
  doc.text("EXPERIENCE", col1X, cursorY);
  cursorY += 8;

  data.experience.forEach(exp => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(exp.role, col1X, cursorY);
    cursorY += 5;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`${exp.company} | ${exp.duration}`, col1X, cursorY);
    cursorY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    exp.points.forEach(point => {
      const bullet = `• ${point}`;
      const splitPoint = doc.splitTextToSize(bullet, col1W);
      doc.text(splitPoint, col1X, cursorY);
      cursorY += (splitPoint.length * 5);
    });
    cursorY += 6;
  });

  // Sidebar Column (Skills, Education)
  let sideY = 75; // Align with experience start
  
  // Skills
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(45, 212, 191);
  doc.text("SKILLS", col2X, sideY);
  sideY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  
  data.skills.forEach(skill => {
    const splitSkill = doc.splitTextToSize(skill, col2W);
    doc.text(splitSkill, col2X, sideY);
    sideY += (splitSkill.length * 5) + 2;
  });

  sideY += 10;

  // Education
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(45, 212, 191);
  doc.text("EDUCATION", col2X, sideY);
  sideY += 8;

  data.education.forEach(edu => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const splitSchool = doc.splitTextToSize(edu.school, col2W);
    doc.text(splitSchool, col2X, sideY);
    sideY += (splitSchool.length * 5);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${edu.degree}`, col2X, sideY);
    sideY += 5;
    doc.text(edu.year, col2X, sideY);
    sideY += 10;
  });
};
