# Architecture

## Structure

- `src/app`: static-exported Next.js entry, metadata, favicon, and design tokens.
- `src/components/practice`: configuration, live practice, and independent typing/MCQ inputs.
- `src/components/analytics`: results, topic statistics, filters, sorting, and answer review.
- `src/features/practice/generators`: six-topic registry, bounded arithmetic/chaining generation, balanced interleaving, and pure MCQ generation.
- `src/features/practice/engine`: validation, reducer, monotonic timing, benchmark resolution, recommendations, and derived analytics.
- `src/tests`: unit, component, and Playwright coverage.

## State and timing

The single reducer moves through `configuring → active → feedback → active/completed`. It rejects submissions outside `active`, which prevents repeated Enter presses from skipping questions. `TimingController` uses `performance.now()`; displayed clocks poll the derived elapsed values but are never the source of truth. Question timing stops on valid submission. Total duration stops on the last valid submission, so feedback animations are excluded from scoring.

## Generation

Mixed topic counts differ by at most one and are shuffled. Generators prefer unseen canonical identities through bounded retries, then allow repeats if the configured pool is exhausted. MCQ choices are attached while constructing a session—not during rendering. The pure MCQ generator builds topic-aware nearby candidates, removes equivalent numeric duplicates, checks safe integers, and uses a bounded deterministic ±delta fallback.

## Analytics

Accuracy is `correct / answered × 100`. Average times use recorded question durations. Questions per minute is `answered / (session duration in minutes)`. Every result carries its answer mode, and no historical store exists; typing and MCQ history therefore cannot be combined.

## Benchmarks and storage

Each question snapshots its effective millisecond target. Analytics compare submitted monotonic duration with that snapshot; disabled targets are excluded. Automatic chaining targets include reveal time. Study data is not persisted; only the acknowledged release version may use local storage.

## Adding a topic

Add its identifier to `PracticeTopic`, a bounded pure factory and canonical identity, validation/configuration, a benchmark estimate, topic-aware distractors, and unit tests. The reducer and timer stay shared.
