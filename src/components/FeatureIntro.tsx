"use client";

import { ArrowUpRight, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

const INTRO_KEY = "mathify-study-intro-seen";

export function FeatureIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shouldShow = window.localStorage.getItem(INTRO_KEY) !== "seen";
    setVisible(shouldShow);
    const target = document.querySelector(".study-link");
    if (shouldShow) target?.classList.add("intro-target");
    return () => target?.classList.remove("intro-target");
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(INTRO_KEY, "seen");
    document.querySelector(".study-link")?.classList.remove("intro-target");
    setVisible(false);
  };

  return <div className="study-intro-backdrop" role="presentation"><div className="intro-pointer" aria-hidden="true"><ArrowUpRight size={25} /><span>Tap Study sheets here</span></div><section className="card study-intro" role="dialog" aria-modal="true" aria-labelledby="study-intro-title"><div className="study-intro-icon"><BookOpen size={22} aria-hidden="true" /></div><p className="eyebrow">New update</p><h2 id="study-intro-title">Study tables, squares and cubes</h2><p>Open <strong>Study sheets</strong> from the home screen, select what you want to learn, and choose your number range. Tables are big and swipeable; squares and cubes are centered for easy reading.</p><button type="button" className="primary" onClick={dismiss}>Show me</button></section></div>;
}
