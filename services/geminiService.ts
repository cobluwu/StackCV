
import { GoogleGenAI, Type } from "@google/genai";
import { PlanType, ResumeData, StructuredRewrite, PortfolioBlueprint, InterviewPrepResponse, RoadmapPhases, AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Using gemini-3.1-pro-preview for better reasoning on complex tasks
const MODEL_NAME = 'gemini-3.1-pro-preview';

// Helper to repair truncated JSON by closing open braces/brackets
const repairTruncatedJSON = (jsonStr: string): string => {
  let repaired = jsonStr.trim();
  
  const stack: string[] = [];
  let inString = false;
  let isEscaped = false;
  
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    
    if (inString) {
      if (char === '\\') {
        isEscaped = !isEscaped;
      } else if (char === '"' && !isEscaped) {
        inString = false;
      } else {
        isEscaped = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        stack.push('}');
      } else if (char === '[') {
        stack.push(']');
      } else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
  }

  // Close open string if truncated inside one
  if (inString) {
    repaired += '"';
  }
  
  // Close remaining open structures
  while (stack.length > 0) {
    repaired += stack.pop();
  }
  
  return repaired;
};

// Robust helper to extract JSON from potentially markdown-wrapped strings
const cleanJsonString = (str: string) => {
  if (!str) return "";
  let text = str.trim();
  
  // 1. Try to find a JSON code block first
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1].trim();
  }
  
  // 2. If no code block, extract between the first '{' and last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }

  // 3. Fallback: return as is (repair function might catch it)
  return text;
};

export const chatWithGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are a helpful, professional, and calm career assistant for Indian students. Your tone is supportive but direct, similar to a Notion document or Apple support. Keep answers concise. Do not use emojis.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const structureResumeContent = async (originalText: string, optimizedData: StructuredRewrite): Promise<ResumeData> => {
  return {
      fullName: optimizedData.fullName || "Candidate Name",
      email: optimizedData.email || "",
      phone: optimizedData.phone || "",
      linkedin: optimizedData.linkedin,
      location: optimizedData.location,
      website: optimizedData.website,
      summary: optimizedData.summary || "",
      experience: optimizedData.experience || [],
      education: optimizedData.education || [],
      skills: optimizedData.skills || [],
      projects: optimizedData.projects || []
  };
};

export const analyzeResume = async (resumeText: string, jobDescText: string, plan: PlanType = 'free', enableTrial: boolean = false) => {
  try {
    let instruction = `
      You are a sophisticated ATS evaluation engine and Senior Technical Recruiter specializing in the **Indian Job Market**.
      Analyze the Resume and Job Description (JD) to produce ATS scoring and structured feedback.
      
      Resume Content:
      ${resumeText.substring(0, 7000)}

      Job Description:
      ${jobDescText.substring(0, 7000)}

      Return a detailed analysis in JSON format based on the schema provided.
      
      SCORING METHODOLOGY:
      A recruiter-aligned ATS scoring system focused on evidence, role fit, and seniority rather than keyword density.

      CORE SIGNALS (80%):
      1. Skill & Experience Fit (30%) -> Mapped to 'skillExperienceMatch'
      2. Keyword Alignment (25%) -> Mapped to 'keywordMatch'
      3. Seniority Alignment (20%) -> Mapped to 'seniorityAlignment'
      4. Evidence Strength (15%) -> Mapped to 'evidenceStrength'

      HYGIENE SIGNALS (20%):
      5. ATS Formatting & Structure (5%) -> Mapped to 'formattingCompliance'
      6. Education Relevance (3-5%) -> Mapped to 'educationMatch'
      7. Language Clarity (2-5%) -> Mapped to 'languageClarity'

      TASKS:
      1. **Calculate Scores**: Final score (0-100) and breakdown.
      2. **Summary Feedback**: 2-3 sentence summary.
      3. **Red Flags**: Critical issues only.
      4. **Keywords**: Extracted, Found, Missing.
      5. **Improvements**: Specific bullet point improvements.
      6. **Grammar**: Identify errors.
      
      7. **Resume Rewrite**: 
         Rewrite the ENTIRE resume for ATS compatibility.
         **CRITICAL CONSTRAINT: BREVITY**.
         - **Experience**: Max 3 bullet points per role. Focus on impact.
         - **Projects**: Max 2 projects. Max 20 words description each.
         - **Summary**: Max 2 sentences.
         - **Skills**: List only top 10-15 relevant skills.
         - Do not invent facts. Clarify existing ones.
      
      8. **Rejection Risk Analysis**: Top 3 specific rejection reasons.
      
      9. **FutureFit Intelligence (Hireability Funnel + Roadmap)**:
         This is a strict recruiter diagnostic. NO motivational language.
         
         A. **Hireability Funnel**:
            Estimate the candidate's survival rate at each stage:
            - "ATS Pass" (Formatting/Keywords)
            - "Recruiter Scan" (Summary/Clarity/Seniority)
            - "Shortlist" (Evidence/Impact/Projects)
            - "Interview" (Overall Fit)
            Identify the *largest drop-off point* and explain WHY (2-4 reasons).
         
         B. **Fix the Leak**:
            List 3-5 prioritized fixes. Each must have an estimated impact (e.g., "+15% Shortlist").
            Calculate a "Projected Funnel" assuming these fixes are made.
         
         C. **Proof Generator** (mapped to 'proofProject'):
            Generate a portfolio project blueprint to specifically fix the Shortlist/Interview gap.
            Must be evidence-based.
         
         D. **Execution Roadmap** (3 Phases):
            - Phase 1 (0-14 Days): Unblock the Funnel. Mandatory resume fixes.
            - Phase 2 (15-45 Days): Strengthen Proof. Projects & Evidence.
            - Phase 3 (45-90 Days): Optional Optimizations. Networking & Interviews.
    `;

    // Tiered Features Logic
    const includeDeepInsights = (plan === 'student' || plan === 'pro' || enableTrial);
    const includeProFeatures = (plan === 'pro' || enableTrial);

    if (includeDeepInsights) {
      instruction += `
      10. **Unlock Roadmap Details**:
         Populate 'executionRoadmap' with specific actions for Phase 1.
      `;
    }

    if (includeProFeatures) {
      instruction += `
      11. **Unlock Pro Features**:
         - Populate 'proofProject'.
         - Populate 'executionRoadmap' fully (Phase 1, 2, and 3).
      `;
    }

    instruction += `
      IMPORTANT OUTPUT RULES:
      - **STRICT JSON ONLY**. No comments.
      - Ensure JSON is valid and complete.
    `;

    // Dynamic Schema Construction
    const schemaProperties: any = {
      score: { type: Type.INTEGER },
      summaryFeedback: { type: Type.STRING },
      scoreBreakdown: {
        type: Type.OBJECT,
        properties: {
          keywordMatch: { type: Type.INTEGER },
          skillExperienceMatch: { type: Type.INTEGER },
          formattingCompliance: { type: Type.INTEGER },
          seniorityAlignment: { type: Type.INTEGER },
          educationMatch: { type: Type.INTEGER },
          languageClarity: { type: Type.INTEGER },
          evidenceStrength: { type: Type.INTEGER }
        },
        required: ["keywordMatch", "skillExperienceMatch", "formattingCompliance", "seniorityAlignment", "educationMatch", "languageClarity", "evidenceStrength"]
      },
      redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
      rejectionAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ["Critical", "Moderate", "Minor"] },
            reason: { type: Type.STRING }
          },
          required: ["severity", "reason"]
        }
      },
      extractedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      foundKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestedBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
      grammarAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            correction: { type: Type.STRING },
            reason: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['spelling', 'grammar', 'tone'] }
          }
        }
      },
      resumeRewrite: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          linkedin: { type: Type.STRING },
          location: { type: Type.STRING },
          website: { type: Type.STRING },
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                duration: { type: Type.STRING },
                points: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                school: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "experience", "skills", "education"]
      },
      proInsights: {
        type: Type.OBJECT,
        properties: {
          // A. Funnel Data
          funnelData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING, enum: ["ATS Pass", "Recruiter Scan", "Shortlist", "Interview"] },
                percentage: { type: Type.NUMBER }
              },
              required: ["stage", "percentage"]
            }
          },
          projectedFunnelData: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 stage: { type: Type.STRING, enum: ["ATS Pass", "Recruiter Scan", "Shortlist", "Interview"] },
                 percentage: { type: Type.NUMBER }
               },
               required: ["stage", "percentage"]
             }
          },
          dropOffStage: { type: Type.STRING },
          whyDropHere: { type: Type.ARRAY, items: { type: Type.STRING } },

          // B. Fixes
          fixPriorities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                stageFixed: { type: Type.STRING },
                impact: { type: Type.STRING }
              },
              required: ["action", "stageFixed", "impact"]
            }
          },

          // C. Proof Project (Reusing PortfolioBlueprint Schema)
          proofProject: {
            type: Type.OBJECT,
            properties: {
              access: { type: Type.STRING, enum: ["unlocked"] },
              projectName: { type: Type.STRING },
              businessProblem: { type: Type.STRING },
              projectObjective: { type: Type.STRING },
              whyThisProjectMatters: { type: Type.STRING },
              skillProof: { type: Type.ARRAY, items: { type: Type.STRING } },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
              resumeBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              interviewTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficultyLevel: { type: Type.STRING },
              timeToComplete: { type: Type.STRING }
            }
          },

          // D. Execution Roadmap
          executionRoadmap: {
            type: Type.OBJECT,
            properties: {
              phase1: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    stageFixed: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["action", "stageFixed", "why"]
                }
              },
              phase2: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    stageFixed: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["action", "stageFixed", "why"]
                }
              },
              phase3: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    stageFixed: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["action", "stageFixed", "why"]
                }
              }
            }
          }
        },
        required: ["funnelData", "dropOffStage", "whyDropHere", "fixPriorities"]
      }
    };
    
    if (includeDeepInsights && schemaProperties.proInsights?.required) {
         schemaProperties.proInsights.required.push("projectedFunnelData", "executionRoadmap");
    }
    if (includeProFeatures && schemaProperties.proInsights?.required) {
         schemaProperties.proInsights.required.push("proofProject");
    }

    const requiredFields = ["score", "summaryFeedback", "scoreBreakdown", "redFlags", "rejectionAnalysis", "extractedKeywords", "foundKeywords", "missingKeywords", "suggestedBullets", "grammarAnalysis", "resumeRewrite", "proInsights"];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: instruction,
      config: {
        temperature: 0,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: requiredFields
        }
      }
    });

    if (response.text) {
      const rawText = cleanJsonString(response.text);
      try {
        return JSON.parse(rawText);
      } catch (parseError) {
        console.warn("Initial JSON parse failed, attempting repair...");
        try {
          const repairedText = repairTruncatedJSON(rawText);
          return JSON.parse(repairedText);
        } catch (repairError) {
          throw new Error(`Analysis failed: ${parseError.message}`);
        }
      }
    } else {
      throw new Error("No response from AI");
    }

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const regenerateExecutionRoadmap = async (resumeText: string, jobDescText: string): Promise<RoadmapPhases> => {
  try {
    const instruction = `
      You are the FutureFit Intelligence Engine.
      Regenerate the **Execution Roadmap** (3 Phases) for this candidate.
      
      Resume: ${resumeText.substring(0, 3000)}
      JD: ${jobDescText.substring(0, 3000)}

      Phases:
      1. 0-14 Days: Unblock Funnel.
      2. 15-45 Days: Strengthen Proof.
      3. 45-90 Days: Optional Optimizations.
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        executionRoadmap: {
            type: Type.OBJECT,
            properties: {
              phase1: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    stageFixed: { type: Type.STRING },
                    why: { type: Type.STRING }
                  },
                  required: ["action", "stageFixed", "why"]
                }
              },
              phase2: {
                 type: Type.ARRAY,
                 items: {
                   type: Type.OBJECT,
                   properties: {
                     action: { type: Type.STRING },
                     stageFixed: { type: Type.STRING },
                     why: { type: Type.STRING }
                   },
                   required: ["action", "stageFixed", "why"]
                 }
              },
              phase3: {
                 type: Type.ARRAY,
                 items: {
                   type: Type.OBJECT,
                   properties: {
                     action: { type: Type.STRING },
                     stageFixed: { type: Type.STRING },
                     why: { type: Type.STRING }
                   },
                   required: ["action", "stageFixed", "why"]
                 }
              }
            },
            required: ["phase1", "phase2", "phase3"]
        }
      },
      required: ["executionRoadmap"]
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: instruction,
      config: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      const data = JSON.parse(cleanJsonString(response.text));
      return data.executionRoadmap;
    }
    throw new Error("Failed to regenerate roadmap");

  } catch (error) {
    console.error("Regenerate Roadmap Error:", error);
    throw error;
  }
};

export const regeneratePortfolioBlueprint = async (resumeText: string, jobDescText: string, currentProjectName?: string): Promise<PortfolioBlueprint> => {
  try {
    const instruction = `
      Generate a NEW, ALTERNATIVE Proof Project Blueprint (Proof Generator).
      ${currentProjectName ? `Previous project: "${currentProjectName}". Do NOT duplicate.` : ''}
      Resume: ${resumeText.substring(0, 3000)}
      JD: ${jobDescText.substring(0, 3000)}
    `;

    const schema = {
      type: Type.OBJECT,
      properties: {
        proofProject: {
          type: Type.OBJECT,
          properties: {
            access: { type: Type.STRING, enum: ["unlocked"] },
            projectName: { type: Type.STRING },
            businessProblem: { type: Type.STRING },
            projectObjective: { type: Type.STRING },
            whyThisProjectMatters: { type: Type.STRING },
            skillProof: { type: Type.ARRAY, items: { type: Type.STRING } },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
            resumeBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            interviewTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficultyLevel: { type: Type.STRING },
            timeToComplete: { type: Type.STRING }
          },
          required: ["projectName", "businessProblem", "projectObjective", "whyThisProjectMatters", "skillProof", "techStack", "deliverables", "resumeBullets", "interviewTalkingPoints", "difficultyLevel", "timeToComplete"]
        }
      },
      required: ["proofProject"]
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: instruction,
      config: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      const data = JSON.parse(cleanJsonString(response.text));
      return data.proofProject;
    }
    throw new Error("Failed to regenerate blueprint");

  } catch (error) {
    console.error("Regenerate Blueprint Error:", error);
    throw error;
  }
};

export const generateInterviewPrep = async (resumeText: string, jobDescText: string, plan: PlanType): Promise<InterviewPrepResponse> => {
  try {
    const isFree = plan === 'free';
    const isStudent = plan === 'student';
    const isPro = plan === 'pro';

    let instruction = `
      You are an Expert Technical Interviewer specializing in the **Indian Job Market**.
      
      **TASK**:
      1. Analyze the provided **Resume** to determine the candidate's **Seniority Level** (e.g., Fresher, Junior (1-3 yrs), Mid-Level (4-7 yrs), Senior (8+ yrs), or Lead/Architect).
      2. Analyze the **Job Description (JD)** to identify core technical requirements and expectations.
      3. Generate a set of 4 interview questions that are **perfectly aligned** with both the candidate's seniority and the JD's specific needs.
      
      **CRITICAL RULES**:
      1. **NO JARGON**: Avoid useless corporate buzzwords, generic motivational fluff, or "HR-speak". Questions must be technical, situational, or behavioral but grounded in reality.
      2. **SENIORITY ALIGNMENT**: 
         - **Fresher/Junior**: Focus on core fundamentals, data structures, specific tool syntax, and project-based learning.
         - **Mid-Level**: Focus on implementation details, debugging, performance optimization, and collaboration.
         - **Senior/Lead**: Focus on system architecture, scalability, trade-offs, leadership, mentoring, and high-level strategy.
      3. **JD RELEVANCE**: Every question must relate back to a skill, tool, or responsibility mentioned in the JD.
      4. **INDIA-FIRST CONTEXT**: Use examples relevant to Indian tech ecosystems (e.g., handling high-concurrency for UPI, e-commerce scale, or local infrastructure constraints).
      5. **BREVITY**: No section (answer, situation, etc.) should exceed 2 lines. No paragraphs.
      6. **TONE**: Professional, direct, and objective. No emojis. No "Good luck" or "You can do it".
      
      **QUESTION STRUCTURE (Strict Order)**:
      - Question 1: **Foundational Understanding** (Core concepts relevant to the role and seniority).
      - Question 2: **Applied Competency** (How to use a specific tool/skill from the JD in a real-world task).
      - Question 3: **Advanced Scenario** (A complex "What if" or "How would you handle" situation tailored to seniority).
      - Question 4: **Technical Depth** (Deep dive into a specific technical challenge, optimization, or architectural trade-off).

      **TIER-SPECIFIC LOGIC**:
      - **FREE TIER**: 
        - Return 1 set.
        - **NO answerSummary**. Set it to "Unlock Student/Pro to see answer".
        - **NO STAR guide**. Omit the STAR object entirely.
        - dailyQuota: "1 Teaser Set".
        - limitNote: "Upgrade to Student/Pro for STAR answers".
      - **STUDENT TIER**:
        - Return 1 set.
        - **Include answerSummary**.
        - **Include STAR guide**.
        - dailyQuota: "5 sets available".
        - limitNote: "Generated via Interview Intelligence — Student Access".
      - **PRO TIER**:
        - Return 1 set.
        - **Include answerSummary**.
        - **Include STAR guide**.
        - dailyQuota: "Unlimited".
        - refreshHint: "Tap refresh for new set".

      Resume:
      ${resumeText.substring(0, 4000)}

      JD:
      ${jobDescText.substring(0, 4000)}
    `;

    const schema: any = {
      type: Type.OBJECT,
      properties: {
        tier: { type: Type.STRING, enum: ['free', 'student', 'pro'] },
        setNumber: { type: Type.INTEGER },
        dailyQuota: { type: Type.STRING },
        limitNote: { type: Type.STRING },
        refreshHint: { type: Type.STRING },
        pdfExportText: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              difficulty: { type: Type.STRING, enum: ["Foundational Understanding", "Applied Competency", "Advanced Scenario", "Technical Depth"] },
              question: { type: Type.STRING },
              answerSummary: { type: Type.STRING },
              STAR: {
                type: Type.OBJECT,
                properties: {
                  situation: { type: Type.STRING },
                  task: { type: Type.STRING },
                  action: { type: Type.STRING },
                  result: { type: Type.STRING }
                },
                required: ["situation", "task", "action", "result"]
              }
            },
            required: ["difficulty", "question", "answerSummary"]
          }
        }
      },
      required: ["tier", "questions"]
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: instruction,
      config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      const data = JSON.parse(cleanJsonString(response.text)) as InterviewPrepResponse;
      
      // Post-process to ensure tier consistency if AI missed it
      data.tier = plan;
      
      if (isFree) {
        data.questions?.forEach(q => {
          q.answerSummary = "Unlock Student/Pro to see answer";
          delete q.STAR;
        });
        data.dailyQuota = "1 Teaser Set";
        data.limitNote = "Upgrade to Student/Pro for STAR answers";
      }

      return data;
    }
    throw new Error("Failed to generate interview prep");

  } catch (error) {
    console.error("Interview Prep Error:", error);
    throw error;
  }
};

export const generateMoreInterviewQuestions = async (resumeText: string, jobDescText: string, existingTopics: string[]) => {
  return []; 
};

export const generateScoreExplanation = async (result: AnalysisResult): Promise<string> => {
  try {
    const context = JSON.stringify({
      score: result.score,
      breakdown: result.scoreBreakdown,
      redFlags: result.redFlags,
      summary: result.summaryFeedback
    });

    const instruction = `
      You are a supportive Career Coach explaining an ATS score.
      DATA: ${context}
      TASK: Explain WHY they got this score. Highlight strongest/weakest areas. Keep it 3-4 sentences.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: instruction,
      config: {
        temperature: 0.7,
        maxOutputTokens: 256,
        responseMimeType: "text/plain"
      }
    });

    return response.text?.trim() || "Could not generate explanation.";
  } catch (error) {
    console.error("Explanation Error:", error);
    return "Unable to explain score at this moment.";
  }
};
