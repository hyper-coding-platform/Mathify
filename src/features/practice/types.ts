export type PracticeTopic = "tables" | "squares" | "cubes" | "addition" | "subtraction" | "chaining";
export type AnswerMode = "typing" | "mcq";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "custom";
export type ArithmeticFilter = "any" | "with-regrouping" | "without-regrouping";
export type ChainingVariant = "expression" | "sequential";
export type ChainOperationMode = "addition" | "subtraction" | "mixed";
export type BenchmarkMode = "recommended" | "custom" | "disabled";
export interface IntRange { start: number; end: number }
export interface TableRange { multiplicand: IntRange; multiplier: IntRange }
export interface BinaryArithmeticConfiguration { left: IntRange; right: IntRange; filter: ArithmeticFilter; allowNegative?: boolean }
export interface ChainingConfiguration { variant: ChainingVariant; operandCount: number; initial: IntRange; operands: IntRange; operationMode: ChainOperationMode; allowNegative: boolean; progression: "manual" | "automatic"; revealIntervalMs: number }
export interface BenchmarkConfiguration { mode: BenchmarkMode; customTargetMs: number }
export interface PracticeConfiguration {
  topic: PracticeTopic | "mixed"; answerMode: AnswerMode; difficulty: Difficulty; questionCount: number; enabledTopics: PracticeTopic[];
  tables: TableRange; squares: IntRange; cubes: IntRange; addition: BinaryArithmeticConfiguration; subtraction: BinaryArithmeticConfiguration;
  chaining: ChainingConfiguration; benchmark: BenchmarkConfiguration;
}
export interface Question {
  id: string; identity: string; topic: PracticeTopic; expression: string; operands: number[]; operations?: ("add" | "subtract")[];
  correctAnswer: number; choices?: number[]; benchmarkMs: number | null; chainingVariant?: ChainingVariant; revealDurationMs?: number;
}
export interface QuestionResult {
  questionId: string; topic: PracticeTopic; expression: string; operands?: number[]; operations?: ("add" | "subtract")[]; answerMode: AnswerMode;
  selectedOption?: number; userAnswer: number; correctAnswer: number; choices?: number[]; isCorrect: boolean; durationMs: number;
  benchmarkMs: number | null; revealDurationMs?: number; answerEntryDurationMs?: number;
}
export type SessionStatus = "configuring" | "active" | "feedback" | "completed";
export interface SessionState { status: SessionStatus; configuration: PracticeConfiguration; questions: Question[]; currentIndex: number; results: QuestionResult[]; lastResult?: QuestionResult; sessionDurationMs: number }
export interface TopicAnalytics { topic: PracticeTopic; total: number; correct: number; accuracy: number; averageTimeMs: number; withinTarget: number; benchmarkEligible: number; normalizedDurationRatio: number | null }
export interface SessionAnalytics {
  total: number; correct: number; incorrect: number; accuracy: number; totalDurationMs: number; averageTimeMs: number; medianTimeMs: number;
  fastestMs: number; slowestMs: number; averageCorrectMs: number; questionsPerMinute: number; averageBenchmarkMs: number | null;
  withinTarget: number; beyondTarget: number; correctWithinTarget: number; withinTargetRate: number | null; correctWithinTargetRate: number | null;
  totalTimeAboveBenchmarkMs: number; normalizedDurationRatio: number | null; slowestCorrect?: QuestionResult; topics: TopicAnalytics[];
}
