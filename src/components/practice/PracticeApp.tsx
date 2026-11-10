"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { FEEDBACK_MS } from "@/features/practice/constants";
import { constructSession } from "@/features/practice/generators/registry";
import { initialSessionState, sessionReducer } from "@/features/practice/engine/session-reducer";
import { TimingController } from "@/features/practice/engine/timing";
import type { PracticeConfiguration, QuestionResult } from "@/features/practice/types";
import { ResultsScreen } from "@/components/analytics/ResultsScreen";
import { ConfigurationScreen } from "./ConfigurationScreen";
import { LivePractice } from "./LivePractice";

export function PracticeApp() {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const timingRef = useRef(new TimingController());
  const transitionRef = useRef<number | null>(null);

  const start = useCallback((configuration: PracticeConfiguration) => {
    const questions = constructSession(configuration);
    dispatch({ type: "START_SESSION", configuration, questions });
    timingRef.current.startSession();
  }, []);

  const submit = useCallback((answer: number) => {
    if (state.status !== "active") return;
    const question = state.questions[state.currentIndex];
    const result: QuestionResult = {
      questionId: question.id, topic: question.topic, expression: question.expression,
      answerMode: state.configuration.answerMode,
      selectedOption: state.configuration.answerMode === "mcq" ? answer : undefined,
      userAnswer: answer, correctAnswer: question.correctAnswer, choices: question.choices,
      isCorrect: answer === question.correctAnswer, durationMs: timingRef.current.questionElapsed(),
    };
    dispatch({ type: "SUBMIT_ANSWER", result });
    const finalQuestion = state.currentIndex === state.questions.length - 1;
    const sessionDurationMs = timingRef.current.sessionElapsed();
    transitionRef.current = window.setTimeout(() => {
      if (finalQuestion) dispatch({ type: "COMPLETE_SESSION", sessionDurationMs });
      else { dispatch({ type: "NEXT_QUESTION" }); timingRef.current.startQuestion(); }
    }, FEEDBACK_MS);
  }, [state.configuration.answerMode, state.currentIndex, state.questions, state.status]);

  useEffect(() => () => { if (transitionRef.current !== null) window.clearTimeout(transitionRef.current); }, []);
  useEffect(() => {
    if (state.status !== "active" && state.status !== "feedback") return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [state.status]);

  const exit = () => {
    if (!window.confirm("Exit this session? Your current progress will be discarded.")) return;
    if (transitionRef.current !== null) window.clearTimeout(transitionRef.current);
    dispatch({ type: "RESET_SESSION", configuration: state.configuration });
  };

  if (state.status === "configuring") return <ConfigurationScreen initial={state.configuration} onStart={start} />;
  if (state.status === "completed") return <ResultsScreen configuration={state.configuration} results={state.results} sessionDurationMs={state.sessionDurationMs} onAgain={() => start(state.configuration)} onChange={() => dispatch({ type: "RESET_SESSION", configuration: state.configuration })} />;
  const question = state.questions[state.currentIndex];
  return <LivePractice question={question} index={state.currentIndex} total={state.questions.length} status={state.status} lastResult={state.lastResult} timing={timingRef.current} onSubmit={submit} onExit={exit} />;
}
