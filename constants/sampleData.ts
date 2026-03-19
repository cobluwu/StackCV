
import { AnalysisResult } from '../types';

export const SAMPLE_RESUME = `John Doe
Software Engineer
Email: john.doe@example.com | Phone: +91 9876543210
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

Summary:
Detail-oriented Software Engineer with 2 years of experience in full-stack development. Proficient in React, Node.js, and Python. Passionate about building scalable web applications and improving user experience.

Experience:
Tech Solutions Pvt Ltd | Software Engineer | June 2022 – Present
- Developed and maintained 5+ web applications using React and Node.js, improving performance by 20%.
- Collaborated with cross-functional teams to define, design, and ship new features.
- Implemented RESTful APIs and integrated third-party services.
- Optimized database queries in MongoDB, reducing response time by 15%.

Innovate Corp | Intern | Jan 2022 – May 2022
- Assisted in the development of a customer dashboard using Vue.js.
- Wrote unit tests using Jest, increasing code coverage by 10%.
- Participated in daily stand-ups and sprint planning.

Education:
Bachelor of Technology in Computer Science | ABC Institute of Technology | 2018 – 2022 | CGPA: 8.5/10

Skills:
- Languages: JavaScript, TypeScript, Python, C++
- Frontend: React, Redux, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express, MongoDB, PostgreSQL
- Tools: Git, Docker, AWS, Jira`;

export const SAMPLE_JD = `Role: Senior Software Engineer (Full Stack)
Company: Global Tech Hub
Location: Bangalore, India (Remote Friendly)

About the Role:
We are looking for a highly skilled Full Stack Developer to join our dynamic team. You will be responsible for developing high-quality web applications and ensuring the best user experience.

Requirements:
- 3+ years of experience in Full Stack Development.
- Strong proficiency in JavaScript, TypeScript, and React.
- Experience with Node.js and Express.
- Knowledge of NoSQL databases like MongoDB.
- Familiarity with cloud services (AWS/Azure).
- Excellent problem-solving skills and attention to detail.
- Ability to work in an Agile environment.

Responsibilities:
- Design and implement scalable frontend and backend components.
- Collaborate with designers and product managers to deliver impactful features.
- Optimize applications for maximum speed and scalability.
- Mentor junior developers and conduct code reviews.
- Stay up-to-date with emerging technologies.`;

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  score: 85,
  summaryFeedback: "Your resume shows strong technical alignment with the Senior Software Engineer role. Your experience with React and Node.js is a direct match, though you could strengthen your evidence of leadership and cloud architecture.",
  scoreBreakdown: {
    keywordMatch: 90,
    skillExperienceMatch: 85,
    formattingCompliance: 95,
    seniorityAlignment: 75,
    educationMatch: 100,
    languageClarity: 90,
    evidenceStrength: 80
  },
  redFlags: [
    "Missing explicit mention of 'Agile' methodology in experience bullets.",
    "Seniority gap: JD asks for 3+ years, resume shows 2 years."
  ],
  rejectionAnalysis: [
    { severity: "Moderate", reason: "Years of experience is slightly below the requested 3+ years." },
    { severity: "Minor", reason: "Lack of explicit 'Agile' or 'Scrum' keywords." }
  ],
  extractedKeywords: ["React", "Node.js", "TypeScript", "Full Stack", "MongoDB", "AWS", "Agile"],
  foundKeywords: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
  missingKeywords: ["Agile", "Scrum", "Cloud Architecture"],
  suggestedBullets: [
    "Led daily stand-ups and sprint planning in an Agile environment to ensure timely delivery of features.",
    "Architected scalable cloud solutions on AWS, improving system reliability by 30%."
  ],
  grammarAnalysis: [
    { original: "Developed and maintained 5+ web applications", correction: "Developed and maintained five or more web applications", reason: "Spell out numbers under ten in formal writing.", type: "grammar" }
  ],
  resumeRewrite: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    summary: "Strategic Software Engineer with 2+ years of experience in full-stack development using React and Node.js. Proven track record of improving application performance and implementing scalable APIs.",
    skills: ["React", "Node.js", "TypeScript", "Python", "MongoDB", "AWS", "Agile"],
    experience: [
      {
        role: "Software Engineer",
        company: "Tech Solutions Pvt Ltd",
        duration: "June 2022 – Present",
        points: [
          "Developed 5+ high-performance web applications using React and Node.js.",
          "Optimized MongoDB queries, reducing API response times by 15%.",
          "Collaborated in Agile teams to deliver scalable features ahead of schedule."
        ]
      }
    ],
    education: [
      { degree: "B.Tech in Computer Science", school: "ABC Institute of Technology", year: "2022" }
    ],
    projects: [
      { name: "E-commerce Platform", description: "Built a full-stack e-commerce site with React and Node.js." }
    ]
  },
  proInsights: {
    funnelData: [
      { stage: "ATS Pass", percentage: 95 },
      { stage: "Recruiter Scan", percentage: 80 },
      { stage: "Shortlist", percentage: 65 },
      { stage: "Interview", percentage: 40 }
    ],
    projectedFunnelData: [
      { stage: "ATS Pass", percentage: 98 },
      { stage: "Recruiter Scan", percentage: 90 },
      { stage: "Shortlist", percentage: 85 },
      { stage: "Interview", percentage: 70 }
    ],
    dropOffStage: "Shortlist",
    whyDropHere: ["Experience duration (2 yrs vs 3+ yrs)", "Lack of leadership evidence"],
    fixPriorities: [
      { action: "Add Agile keywords", stageFixed: "ATS Pass", impact: "+5%" },
      { action: "Quantify leadership impact", stageFixed: "Shortlist", impact: "+20%" }
    ],
    proofProject: {
      access: "unlocked",
      projectName: "Enterprise SaaS Dashboard",
      businessProblem: "Need for real-time data visualization in complex environments.",
      projectObjective: "Build a high-performance dashboard using React and AWS.",
      whyThisProjectMatters: "Demonstrates ability to handle enterprise-level requirements.",
      skillProof: ["React", "AWS", "Data Visualization"],
      techStack: ["React", "Node.js", "AWS Lambda", "DynamoDB"],
      deliverables: ["Functional Dashboard", "Architecture Diagram"],
      resumeBullets: ["Built an enterprise dashboard handling 10k+ concurrent users."],
      interviewTalkingPoints: ["Discussing scalability challenges on AWS."],
      difficultyLevel: "Advanced",
      timeToComplete: "4 weeks"
    },
    executionRoadmap: {
      phase1: [{ action: "Update Resume with Agile keywords", stageFixed: "ATS Pass", why: "To clear automated filters." }],
      phase2: [{ action: "Complete SaaS Dashboard project", stageFixed: "Shortlist", why: "To prove technical depth." }],
      phase3: [{ action: "Mock interviews for Senior roles", stageFixed: "Interview", why: "To polish communication." }]
    }
  }
};
