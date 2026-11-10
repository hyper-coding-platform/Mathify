import { DEFAULT_CONFIGURATION } from "../constants";
import type { PracticeConfiguration, Question, QuestionResult, SessionState } from "../types";

export type SessionAction =
  | { type: "START_SESSION"; configuration: PracticeConfiguration; questions: Question[] }
  | { type: "SUBMIT_ANSWER"; result: QuestionResult }
  | { type: "NEXT_QUESTION" }
  | { type: "COMPLETE_SESSION"; sessionDurationMs: number }
  | { type: "RESET_SESSION"; configuration?: PracticeConfiguration };

export const initialSessionState: SessionState = { status: "configuring", configuration: DEFAULT_CONFIGURATION, questions: [], currentIndex: 0, results: [], sessionDurationMs: 0 };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "START_SESSION":
      if (state.status !== "configuring" && state.status !== "completed") return state;
      return { ...state, status: "active", configuration: action.configuration, questions: action.questions, currentIndex: 0, results: [], lastResult: undefined, sessionDurationMs: 0 };
    case "SUBMIT_ANSWER":
      if (state.status !== "active" || state.results.some((value) => value.questionId === action.result.questionId)) return state;
      return { ...state, status: "feedback", results: [...state.results, action.result], lastResult: action.result };
    case "NEXT_QUESTION":
      if (state.status !== "feedback" || state.currentIndex >= state.questions.length - 1) return state;
      return { ...state, status: "active", currentIndex: state.currentIndex + 1, lastResult: undefined };
    case "COMPLETE_SESSION":
      if (state.status !== "feedback" || state.results.length !== state.questions.length) return state;
      return { ...state, status: "completed", lastResult: undefined, sessionDurationMs: Math.max(0, action.sessionDurationMs) };
    case "RESET_SESSION":
      return { ...initialSessionState, configuration: action.configuration ?? state.configuration };
    default:
      return state;
  }
}
