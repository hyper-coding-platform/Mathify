export class TimingController {
  private sessionStartedAt = 0;
  private questionStartedAt = 0;
  constructor(private readonly now: () => number = () => performance.now()) {}
  startSession() { const time = this.now(); this.sessionStartedAt = time; this.questionStartedAt = time; }
  startQuestion() { this.questionStartedAt = this.now(); }
  questionElapsed() { return Math.max(0, this.now() - this.questionStartedAt); }
  sessionElapsed() { return Math.max(0, this.now() - this.sessionStartedAt); }
}
