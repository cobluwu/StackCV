
export const parseFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await parsePDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName.endsWith('.docx')
    ) {
      return await parseDOCX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await parseTXT(file);
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }
  } catch (error) {
    console.error("File parsing error:", error);
    throw error;
  }
};

const parseTXT = async (file: File): Promise<string> => {
  return await file.text();
};

const parseDOCX = async (file: File): Promise<string> => {
  try {
    const mammothModule = await import('mammoth');
    const mammoth = (mammothModule as any).default || mammothModule;
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("DOCX Parse Error:", error);
    throw new Error("Failed to parse DOCX file.");
  }
};

const parsePDF = async (file: File): Promise<string> => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const pdfjs = (pdfjsLib as any).getDocument ? pdfjsLib : (pdfjsLib as any).default;

    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // Join with space to prevent word fusion, but structure is lost.
      // Validation logic must handle this flat text.
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    // Safety: Check for potential image-only PDF (very low text content)
    if (fullText.trim().length < 50 && pdf.numPages > 0) {
       throw new Error("This appears to be an image-based PDF. Please convert it to text/OCR first.");
    }

    return fullText;
  } catch (e: any) {
    console.error("PDF Parse Error Details:", e);
    throw new Error(e.message || "Failed to parse PDF. Please ensure it is a text-based PDF.");
  }
};

// --- VALIDATION & ANALYSIS LOGIC ---

export interface ResumeMetadata {
  isValid: boolean;
  issues: string[];
  sections: string[];
  metricsCount: number;
  bulletCount: number;
  preview: string;
}

export interface JDMetadata {
  isValid: boolean;
  issues: string[];
  roleDetected: string | null;
  seniorityDetected: string | null;
  coreRequirementsCount: number;
}

export const validateResumeContent = (text: string): ResumeMetadata => {
  const clean = text.trim();
  const issues: string[] = [];
  
  // 1. Length Check (Relaxed to 150 to catch sparser but valid resumes)
  if (clean.length < 150) issues.push("Resume content is too short.");

  // 2. Section Detection
  const commonSections = ['experience', 'work history', 'education', 'skills', 'projects', 'summary', 'objective', 'professional experience', 'technical skills'];
  const lower = clean.toLowerCase();
  const foundSections = commonSections.filter(s => lower.includes(s));
  
  // Check for Experience - crucial for scoring
  if (!foundSections.some(s => s.includes('experience') || s.includes('work') || s.includes('history'))) {
    issues.push("No 'Experience' section detected.");
  }

  // 3. Bullet & Structure Check (Relaxed Regex)
  // PDF extraction often loses newlines, so we search for bullet characters anywhere,
  // or hyphen/asterisk surrounded by spaces/newlines.
  const bulletRegex = /[\u2022\u2023\u25E6\u2043\u2219]|\s[•\-\*]\s|^[•\-\*]/gm;
  const bullets = (clean.match(bulletRegex) || []).length;
  
  // Reduced threshold to 2 to be safer
  if (bullets < 2) {
    issues.push("Few bullet points detected. Use standard bullets (•) or hyphens (-).");
  }

  // 4. Quantifiable Metrics
  const metrics = (clean.match(/\d+%|\$\d+|\d+\+/g) || []).length;

  return {
    isValid: issues.length === 0,
    issues,
    // De-duplicate and format section names for display
    sections: Array.from(new Set(foundSections.map(s => s.split(' ')[0].charAt(0).toUpperCase() + s.split(' ')[0].slice(1)))),
    metricsCount: metrics,
    bulletCount: bullets,
    preview: clean.substring(0, 150) + "..."
  };
};

export const validateJDContent = (text: string): JDMetadata => {
  const clean = text.trim();
  const issues: string[] = [];

  // 1. Length
  if (clean.length < 100) issues.push("Job description is too short.");

  // 2. Marketing Fluff Filter (Heuristic)
  const nonJDIndicators = ["privacy policy", "terms of service", "unsubscribe"];
  const lower = clean.toLowerCase();
  // Relaxed: Only flag if very short AND has these keywords
  if (nonJDIndicators.some(i => lower.includes(i)) && clean.length < 300) {
    issues.push("Text looks like a footer or policy, not a JD.");
  }

  // 3. Extraction
  // Simple heuristic for role
  const roleMatch = clean.match(/(?:looking for a|hiring a|role:|position:)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
  const roleDetected = roleMatch ? roleMatch[1] : null;

  // Seniority
  const seniorityKeywords = ['Senior', 'Lead', 'Principal', 'Junior', 'Intern', 'Entry Level'];
  const seniorityDetected = seniorityKeywords.find(s => lower.includes(s.toLowerCase())) || "Not specified";

  // Requirements Count (simple list detection)
  // Relaxed to check for bullet chars anywhere similar to resume
  const reqCount = (clean.match(/[\u2022\u2023\u25E6\u2043\u2219]|\s[•\-\*]\s/g) || []).length;

  return {
    isValid: issues.length === 0,
    issues,
    roleDetected,
    seniorityDetected,
    coreRequirementsCount: reqCount
  };
};
