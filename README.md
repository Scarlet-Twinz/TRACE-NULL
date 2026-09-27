# TRACE//NULL

**A playable systems-debugging game.**

TRACE//NULL turns software failure investigation into a compact browser game. A simulated production system is collapsing, and your job is to find the hidden root cause before stability reaches zero.

This is intentionally not a CRUD app, dashboard, or AI wrapper. The player learns the system by interacting with it.

## How it plays

- Watch the live system state and incident symptoms.
- Use **TRACE**, **LOGS**, **METRICS**, and **DEPENDENCIES** to gather evidence.
- Identify the root cause instead of repairing the loudest symptom.
- Apply a repair. Good repairs recover stability; bad repairs cost time and stability.
- Solve a chain of incidents and finish with a score.

### First release

The game ships with a small set of deterministic incidents:

- Queue Storm
- Database Lock
- Memory Leak
- Cache Poisoning
- Dependency Timeout

Each incident has a hidden cause, observable evidence, a propagation path, and valid repairs.

## Engineering

The simulation is data-driven and deterministic. The UI is only a client of the game engine, which makes the core rules easy to test.

- TypeScript + Vite
- Zero backend
- Zero database
- Vitest unit tests
- GitHub Actions CI
- Static deployment ready for Vercel or GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

Run the quality gates:

```bash
npm test
npm run build
```

## Why this exists

Most of my portfolio demonstrates that I can build production-style systems. TRACE//NULL demonstrates the same engineering thinking through an interactive simulation: dependency graphs, event propagation, state transitions, failure handling, observability, and recovery.

The project is small by design. The interesting part is the simulation, not the amount of code.

## CI

Every pull request runs the test suite and production build before merge.
