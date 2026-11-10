export type PracticeTopic = "tables" | "squares" | "cubes";
export type AnswerMode = "typing" | "mcq";

export interface IntRange { start: number; end: number }
export interface TableRange { multiplicand: IntRange; multiplier: IntRange }

export interface PracticeConfiguration {
  topic: PracticeTopic | "mixed";
  answerMode: AnswerMode;
  questionCount: number;
  enabledTopics: PracticeTopic[];
  tables: TableRange;
  squares: IntRange;
  cubes: IntRange;
}

export interface Question {
  id: string;
  identity: string;
  topic: PracticeTopic;
  expression: string;
  operands: number[];
  correctAnswer: number;
  choices?: number[];
}

export interface QuestionResult {
  questionId: string;
  topic: PracticeTopic;
  expression: string;
  answerMode: AnswerMode;
  selectedOption?: number;
  userAnswer: number;
  correctAnswer: number;
  choices?: number[];
  isCorrect: boolean;
  durationMs: number;
}

export type SessionStatus = "configuring" | "active" | "feedback" | "completed";

export interface SessionState {
  status: SessionStatus;
  configuration: PracticeConfiguration;
  questions: Question[];
  currentIndex: number;
  results: QuestionResult[];
  lastResult?: QuestionResult;
  sessionDurationMs: number;
}

export interface TopicAnalytics {
  topic: PracticeTopic;
  total: number;
  correct: number;
  averageTimeMs: number;
}

export interface SessionAnalytics {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  totalDurationMs: number;
  averageTimeMs: number;
  fastestMs: number;
  slowestMs: number;
  averageCorrectMs: number;
  questionsPerMinute: number;
  topics: TopicAnalytics[];
}
