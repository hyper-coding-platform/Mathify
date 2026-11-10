"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import type { SessionAnalytics } from "@/features/practice/types";
import { formatSeconds } from "@/lib/format-time";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.closePath();
}

function drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = align;
  context.fillText(text, x, y);
}

async function createResultCard(analytics: SessionAnalytics, topic: string, mode: string) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create the result card.");

  const background = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  background.addColorStop(0, "#eef4ff");
  background.addColorStop(0.55, "#f8faff");
  background.addColorStop(1, "#e8f8f4");
  context.fillStyle = background;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.globalAlpha = 0.75;
  context.fillStyle = "#c7d7ff";
  context.beginPath();
  context.arc(955, 110, 235, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#c7efe5";
  context.beginPath();
  context.arc(80, 1250, 270, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.shadowColor = "rgba(21, 35, 68, 0.12)";
  context.shadowBlur = 42;
  context.shadowOffsetY = 18;
  context.fillStyle = "#ffffff";
  roundedRect(context, 74, 76, 932, 1198, 46);
  context.fill();
  context.shadowColor = "transparent";

  const brandGradient = context.createLinearGradient(124, 126, 194, 196);
  brandGradient.addColorStop(0, "#315fe8");
  brandGradient.addColorStop(1, "#2147c5");
  context.fillStyle = brandGradient;
  roundedRect(context, 124, 126, 72, 72, 20);
  context.fill();
  drawText(context, "×", 160, 181, "700 54px Arial, sans-serif", "#ffffff", "center");
  drawText(context, "SSC Calculation Trainer", 220, 159, "700 29px Arial, sans-serif", "#17233d");
  drawText(context, "Practice faster. Calculate smarter.", 220, 190, "400 21px Arial, sans-serif", "#66748f");

  drawText(context, "PRACTICE COMPLETE", 540, 232, "700 22px Arial, sans-serif", "#315fe8", "center");
  drawText(context, `${analytics.accuracy.toFixed(0)}%`, 540, 445, "800 112px Arial, sans-serif", "#17233d", "center");
  drawText(context, "ACCURACY", 540, 490, "700 22px Arial, sans-serif", "#75829a", "center");

  context.strokeStyle = "#e5eaf3";
  context.lineWidth = 18;
  context.beginPath();
  context.arc(540, 408, 154, -Math.PI / 2, Math.PI * 1.5);
  context.stroke();
  context.strokeStyle = "#315fe8";
  context.lineCap = "round";
  context.beginPath();
  context.arc(540, 408, 154, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (analytics.accuracy / 100));
  context.stroke();
  context.lineCap = "butt";

  const stats = [
    ["CORRECT", `${analytics.correct} / ${analytics.total}`],
    ["AVG. TIME", formatSeconds(analytics.averageTimeMs)],
    ["FASTEST", formatSeconds(analytics.fastestMs)],
    ["QUESTIONS / MIN", analytics.questionsPerMinute.toFixed(1)],
  ];
  stats.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 124 + column * 426;
    const y = 650 + row * 174;
    context.fillStyle = index === 0 ? "#edf3ff" : "#f6f8fc";
    roundedRect(context, x, y, 382, 142, 24);
    context.fill();
    drawText(context, label, x + 28, y + 43, "700 18px Arial, sans-serif", "#75829a");
    drawText(context, value, x + 28, y + 102, "750 39px Arial, sans-serif", index === 0 ? "#315fe8" : "#17233d");
  });

  context.strokeStyle = "#e7ebf2";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(124, 1044);
  context.lineTo(956, 1044);
  context.stroke();
  drawText(context, topic, 124, 1111, "700 29px Arial, sans-serif", "#17233d");
  drawText(context, mode, 956, 1111, "500 25px Arial, sans-serif", "#66748f", "right");
  drawText(context, "Keep going — speed comes from consistency.", 540, 1193, "500 25px Arial, sans-serif", "#66748f", "center");

  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The result card could not be saved.")), "image/png"));
}

export function ShareResultsButton({ analytics, topic, mode }: { analytics: SessionAnalytics; topic: string; mode: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const share = async () => {
    setBusy(true);
    setStatus("");
    try {
      const blob = await createResultCard(analytics, topic, mode);
      const file = new File([blob], "ssc-practice-result.png", { type: "image/png" });
      const text = `I scored ${analytics.correct}/${analytics.total} (${analytics.accuracy.toFixed(0)}%) on ${topic} in SSC Calculation Trainer.`;
      const canShareFile = typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({ title: "My SSC practice result", text, files: [file] });
        setStatus("Result shared.");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
        setStatus("Result card downloaded — share it anywhere.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(error instanceof Error ? error.message : "Unable to share this result.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="share-action">
    <button type="button" className="share-button" onClick={share} disabled={busy}><Share2 size={19} aria-hidden="true" /> {busy ? "Preparing card…" : "Share Results"}</button>
    <span className="share-status" role="status" aria-live="polite">{status}</span>
  </div>;
}
