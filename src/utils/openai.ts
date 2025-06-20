import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  
  private constructor() {}
  
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async generateTutorResponse(
    userMessage: string, 
    subject?: string, 
    context?: string[]
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(subject, context);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  }

  async generateQuizQuestions(
    subject: string, 
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 5
  ): Promise<any[]> {
    try {
      const prompt = `Generate ${count} ${difficulty} level multiple choice questions about ${topic} in ${subject}. 
      Return as JSON array with this structure:
      [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Why this answer is correct"
        }
      ]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch {
          // If JSON parsing fails, return empty array
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Quiz generation error:', error);
      return [];
    }
  }

  async generateStudyPlan(
    subject: string, 
    currentLevel: string, 
    goals: string[], 
    timeAvailable: number
  ): Promise<string> {
    try {
      const prompt = `Create a personalized study plan for ${subject}. 
      Current level: ${currentLevel}
      Goals: ${goals.join(', ')}
      Time available per week: ${timeAvailable} hours
      
      Provide a structured plan with weekly breakdown, specific topics to cover, and recommended study methods.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.6,
      });

      return completion.choices[0]?.message?.content || "Unable to generate study plan at this time.";
    } catch (error) {
      console.error('Study plan generation error:', error);
      return "Unable to generate study plan at this time.";
    }
  }

  async explainConcept(
    concept: string, 
    subject: string, 
    level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<string> {
    try {
      const prompt = `Explain the concept of "${concept}" in ${subject} for a ${level} level student. 
      Use clear examples, analogies where helpful, and break down complex ideas into digestible parts.
      Make it engaging and easy to understand.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "Unable to explain this concept at the moment.";
    } catch (error) {
      console.error('Concept explanation error:', error);
      return "Unable to explain this concept at the moment.";
    }
  }

  private buildSystemPrompt(subject?: string, context?: string[]): string {
    let prompt = `You are an expert AI tutor designed to help students learn effectively. You should:
    - Provide clear, accurate explanations
    - Use examples and analogies to make concepts understandable
    - Encourage critical thinking
    - Be patient and supportive
    - Adapt your teaching style to the student's needs
    - Ask follow-up questions to ensure understanding`;

    if (subject) {
      prompt += `\n- You are specifically helping with ${subject}`;
    }

    if (context && context.length > 0) {
      prompt += `\n- Previous conversation context: ${context.join(', ')}`;
    }

    return prompt;
  }
}

export const openAIService = OpenAIService.getInstance();