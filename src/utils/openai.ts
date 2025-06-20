import OpenAI from 'openai';

// Initialize OpenAI client with error handling
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.warn('OpenAI API key not configured. Using fallback responses.');
    return null;
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
  });
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  modules: CourseModule[];
  prerequisites: string[];
  learningObjectives: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  estimatedTime: number;
  order: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'quiz' | 'assignment';
  duration: number;
  order: number;
  keyPoints: string[];
  examples: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI | null;
  
  private constructor() {
    this.client = getOpenAIClient();
  }
  
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private async makeRequest<T>(
    requestFn: (client: OpenAI) => Promise<T>,
    fallbackFn: () => T
  ): Promise<T> {
    if (!this.client) {
      console.log('Using fallback response - OpenAI API key not configured');
      return fallbackFn();
    }

    try {
      return await requestFn(this.client);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return fallbackFn();
    }
  }

  async generateTutorResponse(
    userMessage: string, 
    subject?: string, 
    context?: string[]
  ): Promise<string> {
    return this.makeRequest(
      async (client) => {
        const systemPrompt = this.buildTutorSystemPrompt(subject, context);
        
        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
      },
      () => this.getFallbackTutorResponse(userMessage, subject)
    );
  }

  async generateCourse(
    subject: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    duration: number, // in hours
    specificTopics?: string[]
  ): Promise<GeneratedCourse> {
    return this.makeRequest(
      async (client) => {
        const prompt = this.buildCourseGenerationPrompt(subject, level, duration, specificTopics);
        
        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3000,
          temperature: 0.6,
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          try {
            return JSON.parse(response);
          } catch {
            return this.getFallbackCourse(subject, level, duration);
          }
        }
        return this.getFallbackCourse(subject, level, duration);
      },
      () => this.getFallbackCourse(subject, level, duration)
    );
  }

  async generateLessonContent(
    subject: string,
    topic: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    lessonType: 'text' | 'video' | 'quiz' | 'assignment' = 'text'
  ): Promise<CourseLesson> {
    return this.makeRequest(
      async (client) => {
        const prompt = this.buildLessonContentPrompt(subject, topic, level, lessonType);
        
        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          try {
            return JSON.parse(response);
          } catch {
            return this.getFallbackLesson(topic, lessonType);
          }
        }
        return this.getFallbackLesson(topic, lessonType);
      },
      () => this.getFallbackLesson(topic, lessonType)
    );
  }

  async generateQuizQuestions(
    subject: string, 
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 5
  ): Promise<QuizQuestion[]> {
    return this.makeRequest(
      async (client) => {
        const prompt = this.buildQuizPrompt(subject, topic, difficulty, count);

        const completion = await client.chat.completions.create({
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
            return this.getFallbackQuizQuestions(subject, topic, count);
          }
        }
        return this.getFallbackQuizQuestions(subject, topic, count);
      },
      () => this.getFallbackQuizQuestions(subject, topic, count)
    );
  }

  async generateStudyPlan(
    subject: string, 
    currentLevel: string, 
    goals: string[], 
    timeAvailable: number
  ): Promise<string> {
    return this.makeRequest(
      async (client) => {
        const prompt = `Create a personalized study plan for ${subject}. 
        Current level: ${currentLevel}
        Goals: ${goals.join(', ')}
        Time available per week: ${timeAvailable} hours
        
        Provide a structured plan with:
        1. Weekly breakdown
        2. Specific topics to cover
        3. Recommended study methods
        4. Milestones and checkpoints
        5. Resources and materials needed
        
        Make it practical and achievable.`;

        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
          temperature: 0.6,
        });

        return completion.choices[0]?.message?.content || "Unable to generate study plan at this time.";
      },
      () => this.getFallbackStudyPlan(subject, currentLevel, goals, timeAvailable)
    );
  }

  async explainConcept(
    concept: string, 
    subject: string, 
    level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<string> {
    return this.makeRequest(
      async (client) => {
        const prompt = `Explain the concept of "${concept}" in ${subject} for a ${level} level student. 

        Structure your explanation with:
        1. Simple definition
        2. Key components or parts
        3. Real-world examples or analogies
        4. Common misconceptions to avoid
        5. How it connects to other concepts
        
        Use clear, engaging language and break down complex ideas into digestible parts.`;

        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1200,
          temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "Unable to explain this concept at the moment.";
      },
      () => this.getFallbackConceptExplanation(concept, subject, level)
    );
  }

  // Private helper methods for building prompts
  private buildTutorSystemPrompt(subject?: string, context?: string[]): string {
    let prompt = `You are an expert AI tutor designed to help students learn effectively. You should:
    - Provide clear, accurate explanations
    - Use examples and analogies to make concepts understandable
    - Encourage critical thinking and ask follow-up questions
    - Be patient, supportive, and encouraging
    - Adapt your teaching style to the student's needs
    - Break down complex problems into manageable steps
    - Provide practical applications and real-world connections`;

    if (subject) {
      prompt += `\n- You are specifically helping with ${subject}`;
    }

    if (context && context.length > 0) {
      prompt += `\n- Previous conversation context: ${context.join(', ')}`;
    }

    return prompt;
  }

  private buildCourseGenerationPrompt(
    subject: string,
    level: string,
    duration: number,
    specificTopics?: string[]
  ): string {
    return `Generate a comprehensive ${level} level course for ${subject} that takes approximately ${duration} hours to complete.

    ${specificTopics ? `Focus on these specific topics: ${specificTopics.join(', ')}` : ''}

    Return a JSON object with this exact structure:
    {
      "id": "unique-course-id",
      "title": "Course Title",
      "description": "Detailed course description",
      "difficulty": "${level}",
      "estimatedHours": ${duration},
      "prerequisites": ["prerequisite1", "prerequisite2"],
      "learningObjectives": ["objective1", "objective2", "objective3"],
      "modules": [
        {
          "id": "module-1",
          "title": "Module Title",
          "description": "Module description",
          "estimatedTime": 10,
          "order": 1,
          "lessons": [
            {
              "id": "lesson-1",
              "title": "Lesson Title",
              "content": "Detailed lesson content",
              "type": "text",
              "duration": 30,
              "order": 1,
              "keyPoints": ["point1", "point2"],
              "examples": ["example1", "example2"]
            }
          ]
        }
      ]
    }

    Make sure the course is well-structured, progressive, and includes practical examples.`;
  }

  private buildLessonContentPrompt(
    subject: string,
    topic: string,
    level: string,
    lessonType: string
  ): string {
    return `Generate detailed lesson content for "${topic}" in ${subject} at ${level} level.
    Lesson type: ${lessonType}

    Return a JSON object with this structure:
    {
      "id": "lesson-id",
      "title": "Lesson Title",
      "content": "Comprehensive lesson content (markdown format)",
      "type": "${lessonType}",
      "duration": 30,
      "order": 1,
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "examples": ["practical example 1", "practical example 2"]
    }

    The content should be engaging, educational, and include practical examples.`;
  }

  private buildQuizPrompt(subject: string, topic: string, difficulty: string, count: number): string {
    return `Generate ${count} ${difficulty} level multiple choice questions about "${topic}" in ${subject}. 

    Return as a JSON array with this exact structure:
    [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed explanation of why this answer is correct",
        "difficulty": "${difficulty}"
      }
    ]

    Make questions that test understanding, not just memorization.`;
  }

  // Fallback methods for when OpenAI API is not available
  private getFallbackTutorResponse(userMessage: string, subject?: string): string {
    const responses = [
      `That's a great question about ${subject || 'this topic'}! Let me help you understand this concept better. ${userMessage.includes('?') ? 'To answer your question:' : 'Here\'s what you should know:'} This is a fundamental concept that builds on previous knowledge and connects to many other areas of study.`,
      `I can see you're thinking deeply about ${subject || 'this subject'}. This is exactly the kind of question that shows real understanding! Let me break this down for you step by step.`,
      `Excellent question! This topic in ${subject || 'this area'} is really important because it forms the foundation for more advanced concepts. Let me explain it in a way that makes it clear and memorable.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getFallbackCourse(subject: string, level: string, duration: number): GeneratedCourse {
    return {
      id: `course-${Date.now()}`,
      title: `${subject} Fundamentals`,
      description: `A comprehensive ${level} level course in ${subject} designed to build strong foundational knowledge.`,
      difficulty: level as any,
      estimatedHours: duration,
      prerequisites: level === 'beginner' ? [] : [`Basic ${subject} knowledge`],
      learningObjectives: [
        `Understand core concepts in ${subject}`,
        `Apply knowledge to solve practical problems`,
        `Build confidence in ${subject} skills`
      ],
      modules: [
        {
          id: 'module-1',
          title: `Introduction to ${subject}`,
          description: `Getting started with ${subject} fundamentals`,
          estimatedTime: Math.floor(duration / 3),
          order: 1,
          lessons: [
            {
              id: 'lesson-1',
              title: `What is ${subject}?`,
              content: `# Introduction to ${subject}\n\nWelcome to your ${subject} journey! This lesson will introduce you to the fundamental concepts and help you understand why ${subject} is important.\n\n## Key Concepts\n\n- Definition and scope\n- Historical context\n- Real-world applications\n\n## Getting Started\n\nLet's begin by understanding the basics...`,
              type: 'text',
              duration: 30,
              order: 1,
              keyPoints: [`Definition of ${subject}`, 'Historical background', 'Modern applications'],
              examples: ['Real-world example 1', 'Real-world example 2']
            }
          ]
        }
      ]
    };
  }

  private getFallbackLesson(topic: string, lessonType: string): CourseLesson {
    return {
      id: `lesson-${Date.now()}`,
      title: topic,
      content: `# ${topic}\n\nThis lesson covers the essential concepts of ${topic}.\n\n## Overview\n\nIn this lesson, you will learn about the key principles and applications of ${topic}.\n\n## Key Concepts\n\n- Fundamental principles\n- Practical applications\n- Common examples\n\n## Summary\n\nBy the end of this lesson, you should have a solid understanding of ${topic} and be able to apply these concepts in practice.`,
      type: lessonType as any,
      duration: 30,
      order: 1,
      keyPoints: ['Key principle 1', 'Key principle 2', 'Key principle 3'],
      examples: ['Example 1', 'Example 2']
    };
  }

  private getFallbackQuizQuestions(subject: string, topic: string, count: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `What is an important concept in ${topic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `This is the correct answer because it represents a fundamental principle in ${topic}.`,
        difficulty: 'medium'
      });
    }
    return questions;
  }

  private getFallbackStudyPlan(subject: string, level: string, goals: string[], timeAvailable: number): string {
    return `# Personalized Study Plan for ${subject}

## Current Level: ${level}

## Goals:
${goals.map(goal => `- ${goal}`).join('\n')}

## Weekly Schedule (${timeAvailable} hours/week):

### Week 1-2: Foundation Building
- Review fundamental concepts
- Complete basic exercises
- Time allocation: ${Math.floor(timeAvailable / 3)} hours/week

### Week 3-4: Skill Development
- Practice intermediate problems
- Work on practical applications
- Time allocation: ${Math.floor(timeAvailable / 2)} hours/week

### Week 5-6: Advanced Topics
- Explore complex concepts
- Complete challenging projects
- Time allocation: ${timeAvailable} hours/week

## Recommended Resources:
- Textbooks and online materials
- Practice problems and exercises
- Video tutorials and lectures

## Milestones:
- Week 2: Complete foundation assessment
- Week 4: Mid-course evaluation
- Week 6: Final project completion`;
  }

  private getFallbackConceptExplanation(concept: string, subject: string, level: string): string {
    return `# Understanding ${concept} in ${subject}

## Simple Definition
${concept} is a fundamental concept in ${subject} that helps us understand how things work in this field.

## Key Components
- Component 1: Basic building block
- Component 2: How it connects to other ideas
- Component 3: Practical applications

## Real-World Example
Think of ${concept} like something you encounter in everyday life. Just as [analogy], ${concept} works by [explanation].

## Common Misconceptions
Many ${level} students think that ${concept} is [misconception], but actually it's [correction].

## Connection to Other Concepts
${concept} is closely related to other important ideas in ${subject}, and understanding it will help you grasp more advanced topics later.`;
  }
}

export const openAIService = OpenAIService.getInstance();