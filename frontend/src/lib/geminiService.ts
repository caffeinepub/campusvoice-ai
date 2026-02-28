import { COMPLAINT_CATEGORIES, DEPARTMENTS } from '../constants/complaintCategories';

// Use the platform-injected API key or env variable
function getApiKey(): string {
  return (
    (typeof window !== 'undefined' && (window as unknown as Record<string, string>).GEMINI_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

async function generateContent(contents: GeminiContent[]): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Gemini API key available');

  const url = `${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = (await res.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

// ─── Exported types ───────────────────────────────────────────────────────────

export interface AIAnalysisResult {
  category: string;
  priority: 'high' | 'medium' | 'low';
  department: string;
  estimatedDays: number;
  reasoning: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Exported functions ───────────────────────────────────────────────────────

export async function analyzeComplaintText(description: string): Promise<AIAnalysisResult | null> {
  if (!description.trim() || !getApiKey()) return null;

  try {
    const prompt = `You are an AI assistant for a campus complaint management system. Analyze the following complaint and respond with ONLY a JSON object (no markdown, no explanation).

Complaint: "${description}"

Available categories: ${COMPLAINT_CATEGORIES.join(', ')}
Available departments: ${DEPARTMENTS.join(', ')}

Respond with this exact JSON structure:
{
  "category": "<one of the available categories>",
  "priority": "<high|medium|low>",
  "department": "<one of the available departments or 'General Administration'>",
  "estimatedDays": <number 1-30>,
  "reasoning": "<brief one-sentence explanation>"
}

Priority guidelines: high=safety/urgent issues (ragging, harassment, exam issues), medium=academic/facility issues, low=suggestions/minor issues.`;

    const text = await generateContent([{ parts: [{ text: prompt }] }]);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as AIAnalysisResult;
  } catch {
    return null;
  }
}

export async function analyzeImage(base64Image: string): Promise<string | null> {
  if (!base64Image || !getApiKey()) return null;

  try {
    const text = await generateContent([
      {
        parts: [
          {
            text: 'Analyze this campus facility image and describe any visible issues, damage, or problems in 2-3 sentences. Be specific and factual.',
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.replace(/^data:image\/[a-z]+;base64,/, ''),
            },
          },
        ],
      },
    ]);
    return text || null;
  } catch {
    return null;
  }
}

export async function getChatbotResponse(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  if (!getApiKey()) {
    return "I'm sorry, the AI assistant is currently unavailable. Please contact the administration directly for help.";
  }

  try {
    const systemContext = `You are CampusVoice AI Assistant, a helpful chatbot for a campus complaint management system.
You help students with:
- Submitting complaints (guide them through the process)
- Tracking complaint status
- Understanding complaint categories and priorities
- Campus policies and procedures
- FAQs about the complaint system

Be concise, friendly, and helpful. If asked about specific complaint status, remind them to check the "Track Complaints" section.`;

    const conversationHistory = history
      .map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `${systemContext}\n\nConversation history:\n${conversationHistory}\n\nStudent: ${userMessage}\n\nAssistant:`;

    const text = await generateContent([{ parts: [{ text: prompt }] }]);
    return text || "I couldn't process your request. Please try again.";
  } catch {
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

export async function runPredictiveAnalysis(complaintsData: string): Promise<string> {
  if (!getApiKey()) return 'AI analysis unavailable. Please check your API key configuration.';

  try {
    const prompt = `You are an expert campus administrator analyzing complaint data. Based on the following complaint statistics, provide:
1. Top 3 recurring issues
2. Predicted trends for next month
3. 3 strategic recommendations for improvement
4. Departments needing immediate attention

Complaint Data:
${complaintsData}

Provide a structured, actionable analysis in 300-400 words.`;

    const text = await generateContent([{ parts: [{ text: prompt }] }]);
    return text || 'Analysis could not be generated.';
  } catch {
    return 'Failed to generate analysis. Please try again.';
  }
}
