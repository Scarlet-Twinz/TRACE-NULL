# TRACE//NULL

**A small browser game about debugging a failing software system.**

TRACE//NULL turns a familiar software-engineering problem — something is broken and you need to find out why — into a game.

You are the engineer on duty. A simulated production system is developing failures. You have limited time, incomplete information, logs, metrics, dependencies, and several possible repairs.

Your job is not to guess. Your job is to investigate the evidence, identify the root cause, and repair the system before it collapses.

## What is TRACE//NULL?

TRACE//NULL is a playable systems-debugging game built with TypeScript and Vite.

The game simulates a small production system containing an API Gateway, Job Queue, Worker, Cache, and Database.

When an incident happens, the system starts becoming unstable. A failure can travel from one component to another, creating symptoms that make the original problem harder to see.

The central rule is simple:

> Do not repair the loudest symptom. Find the root cause.

## Is it really a game?

Yes. TRACE//NULL has a complete game loop:

1. An incident appears.
2. You investigate it.
3. You collect evidence.
4. You make a root-cause diagnosis.
5. You choose a repair.
6. Correct decisions improve your result; bad decisions cost time and stability.
7. You continue through a five-incident run.
8. You receive a final run score.

The game has a timer, stability, hidden information, multiple choices, consequences, scoring, progression, win states, loss states, and replayability.

It is intentionally a small game. The challenge comes from the decisions the player makes rather than from having a huge amount of content.

## How to play

### 1. Watch the incident

You begin with an incident such as QUEUE STORM. You receive a short briefing and visible symptoms.

Symptoms are clues. They are not automatically the root cause.

### 2. Investigate the system

You have four investigation tools:

- TRACE — shows how a failure moves between components.
- LOGS — shows events recorded by the simulated system.
- METRICS — shows measurements such as CPU, memory, latency, queue depth, and errors.
- DEPENDENCIES — shows which components depend on each other.

### 3. Build your evidence

Every investigation tool reveals evidence. The game remembers the evidence you collected so you can reason from several clues instead of relying on one clue.

### 4. Diagnose the root cause

Version 2 adds an explicit diagnosis step. You choose what you believe is actually causing the incident.

A correct diagnosis earns points. A wrong diagnosis costs stability and time.

This makes the game test reasoning rather than simple button clicking.

### 5. Repair the system

After investigating, you choose a repair. Several actions may look reasonable, but only the correct repair addresses the real cause.

A correct repair stabilizes the system. A symptom-level repair wastes valuable time and stability.

### 6. Survive the run

Version 2 turns individual incidents into a complete run.

A run contains five randomly selected incidents from the incident library. Survive all five and the system is recovered.

## Scoring

Your score rewards good engineering decisions.

You can earn points for correctly diagnosing the root cause, collecting evidence, using investigation tools, repairing the correct failure, and preserving time.

You can lose points or stability through incorrect diagnoses, bad repairs, and wasted time.

At the end of a successful run, TRACE//NULL produces a final incident report containing the run score and summary information.

## Incidents

Version 2 contains ten incidents:

| Incident | What the player investigates |
| --- | --- |
| Queue Storm | An unlimited worker retry loop |
| Database Lock | A long-running database transaction |
| Memory Leak | Retained objects consuming worker memory |
| Cache Poisoning | Invalid state stored in the cache |
| Dependency Timeout | A dependency timeout larger than the request budget |
| Retry Cascade | Unbounded retries multiplying traffic |
| Connection Exhaustion | Database connections leaking from workers |
| Config Drift | One worker running outdated configuration |
| Dead Letter Flood | A producer continuously creating invalid jobs |
| Circuit Breaker | An overly sensitive dependency protection threshold |

Each incident contains a briefing, symptoms, a hidden root cause, propagation steps, investigation evidence, possible diagnoses, possible repairs, and one correct solution.

## System model

TRACE//NULL represents a simplified production system:

API Gateway → Cache / Job Queue → Worker → Database

The actual incident can change how those components behave. The player therefore has to understand relationships between components instead of treating every component as an isolated box.

## Version 2 improvements

Version 1 established the basic idea: investigate a failure and repair it.

Version 2 expands that idea without turning the project into something unnecessarily large.

Version 1 had five incidents, investigation tools, evidence, repairs, stability, a timer, scoring, and win/loss states.

Version 2 adds ten incidents, five-incident runs, explicit root-cause diagnosis, evidence collection, component telemetry, CPU/memory/latency/error metrics, more deceptive failure chains, diagnosis scoring, run progression, a final report, replayable runs, and an upgraded responsive interface.

The original small architecture remains intact. V2 extends the game rules rather than rebuilding the project around unnecessary infrastructure.

## Architecture

TRACE//NULL is a frontend-only game.

There is no backend, database, authentication system, or external API required to play it.

The important separation is between the game simulation and the user interface. The simulation owns incidents, state, evidence, scoring, diagnosis, repairs, and failure rules. The interface displays that state and lets the player interact with it.

This makes the core game rules easier to test without requiring a browser.

## Repository structure

TRACE-NULL/

├── src/

│   ├── game.ts          — game state, incidents, rules, scoring

│   ├── game.test.ts     — simulation tests

│   ├── main.ts          — browser UI and game loop

│   └── style.css        — interface styling

├── .github/workflows/

│   └── ci.yml           — GitHub Actions quality gate

├── index.html           — browser entry point

├── package.json         — scripts and dependencies

├── tsconfig.json        — TypeScript configuration

└── README.md

## Technology

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Build tool | Vite |
| Testing | Vitest |
| Interface | HTML and CSS |
| Runtime | Browser |
| CI | GitHub Actions |
| Backend | None |
| Database | None |

The project deliberately avoids unnecessary infrastructure. The game does not need a server to demonstrate its core idea.

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- A modern web browser

### Download the project

You can download the repository directly from GitHub using the Code → Download ZIP option, or clone it with:

    git clone https://github.com/Scarlet-Twinz/TRACE-NULL.git
    cd TRACE-NULL

### Install dependencies

    npm install

### Start the game

    npm run dev

Vite will provide a local address, normally similar to http://localhost:5173. Open that address in your browser.

## Testing

Run the automated simulation tests with:

    npm test

Check the production build with:

    npm run build

## CI

Every pull request is checked by GitHub Actions.

The CI workflow checks out the repository, installs Node.js dependencies, runs the automated tests, creates the production build, and reports whether the quality gate passed.

Version 2 was verified through this CI path before being merged.

## Deployment

TRACE//NULL is a static browser application. It can be deployed to Vercel, GitHub Pages, or another static hosting provider.

No server-side runtime is required.

## Design principles

### Keep the game small

TRACE//NULL is not trying to become a huge game. The goal is a polished, understandable experience with a strong central mechanic.

### Make the engineering visible

The game should help players understand what is happening instead of hiding everything behind an opaque score.

### Separate symptoms from causes

A visible failure is not necessarily the original failure. That distinction is the central mechanic.

### Keep the simulation testable

Game rules should be deterministic and testable independently from the interface.

### Avoid unnecessary infrastructure

There is no reason to add a backend simply because the project is a software project.

## Why this project exists

Most software projects demonstrate that an application can store data, expose an API, display information, or automate a workflow.

TRACE//NULL explores something different:

> Can software-engineering concepts themselves become the mechanics of a game?

The game uses ideas that appear in real engineering work: dependency graphs, event propagation, observability, logs, metrics, queues, retries, resource exhaustion, state transitions, failure handling, root-cause analysis, and recovery.

A beginner can play it without knowing those concepts beforehand. Someone with a software-engineering background can also recognize why those concepts matter.

That is intentional.

## Current status

**Version 2 — playable and CI-verified.**

The current release contains the complete V2 game loop, ten incidents, investigation and diagnosis mechanics, five-incident runs, scoring, final results, responsive UI, automated tests, and GitHub Actions validation.

The project is intentionally treated as a small finished game rather than an unfinished foundation for a much larger game.

## Future ideas

Possible future improvements include sound effects, subtle system-failure animations, more advanced incident chains, accessibility improvements, keyboard shortcuts, additional difficulty modes, and a local high-score history.

These are future ideas, not requirements for the current release.

## Author

**Anthony Emmanuella Mmasinachi**

Full-stack and systems-focused developer building projects across web applications, backend systems, SaaS architecture, automation, AI integration, and practical software engineering.

## Project links

- Repository: https://github.com/Scarlet-Twinz/TRACE-NULL
- Author: Anthony Emmanuella Mmasinachi
- GitHub: https://github.com/Scarlet-Twinz

## License

This repository is intended as a personal project and portfolio work. See the repository for the applicable licensing information.

CI verification follows the V2 release gate.
