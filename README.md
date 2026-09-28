# TRACE//NULL

**A browser-based systems-debugging game where you investigate production incidents, identify root causes, and recover a failing system under pressure.**

TRACE//NULL turns real software-engineering concepts—observability, dependency chains, queues, retries, resource exhaustion, diagnosis, and recovery—into a playable decision-making experience.

You are not trying to click the correct button as quickly as possible. You are trying to **understand what is happening, use the available evidence, identify the underlying cause, and choose the repair that actually fixes it.**

## Play the game

**[▶ PLAY TRACE//NULL](https://scarlet-twinz.github.io/TRACE-NULL/)**

The live version runs entirely in the browser. No installation is required.

If you want to inspect or run the project locally, the repository also includes the complete TypeScript source, tests, build configuration, and GitHub Actions workflows.

---

## What is the game?

TRACE//NULL simulates a small production system made up of:

- **API Gateway** — receives traffic and coordinates requests.
- **Job Queue** — transports asynchronous work.
- **Worker** — processes background jobs.
- **Cache** — stores fast-access state.
- **Database** — stores persistent application state.

Something goes wrong inside this system.

The visible symptoms might be high latency, rising queue depth, memory pressure, failed requests, stale data, or exhausted connections. Those symptoms are clues, not necessarily the root cause.

Your task is to work from the evidence toward the actual failure.

The central rule is:

> **Debug the system, not the symptom.**

---

## How to play

When a run starts, the game presents an incident with a short briefing and several visible symptoms.

For example, you might see a worker under heavy CPU load while the queue keeps growing.

That does **not** automatically mean the worker itself is the root cause.

The game gives you tools to investigate before you commit to a diagnosis.

### The investigation tools

There are four tools available:

| Tool | What it tells you |
| --- | --- |
| **TRACE** | Shows how the failure is moving through the system and which components are involved. |
| **LOGS** | Shows recorded events that can reveal repeated actions, errors, stale state, waits, retries, or other clues. |
| **METRICS** | Shows system measurements such as CPU, memory, latency, queue depth, connection usage, and errors. |
| **DEPENDENCIES** | Shows relationships between components and helps you understand which component depends on another. |

Each tool reveals evidence specific to the current incident.

You can use the same tool more than once, but the first use of a tool is more valuable than repeating it.

### Evidence matters

The game keeps the evidence you discover.

You should compare clues rather than relying on a single symptom.

For example:

- a queue is growing;
- the worker CPU is high;
- logs show the same job being retried repeatedly;
- TRACE shows traffic returning from the worker to the queue.

Taken together, those clues point toward a retry problem rather than simply "the API is slow."

That is the kind of reasoning TRACE//NULL is testing.

---

## Root-cause diagnosis

After investigating, the **ROOT-CAUSE DIAGNOSIS** section gives you several possible explanations.

Choose the diagnosis that best explains the evidence you collected.

A correct diagnosis:

- confirms the root cause;
- awards points;
- costs a small amount of time because making a decision takes time.

A wrong diagnosis:

- removes points;
- reduces system stability;
- costs additional time;
- tells you to continue investigating.

The game does not require you to diagnose immediately. You can keep investigating while the incident is still active.

---

## Repairing the system

Once you are ready, use the **REPAIR CONSOLE**.

The available repairs are intentionally designed so that more than one option can look reasonable.

The important question is:

> **Which repair addresses the underlying cause rather than the visible symptom?**

A correct repair resolves the incident and awards the main repair score.

A wrong repair does not end the run immediately, but it:

- reduces stability;
- costs time;
- reduces your score;
- gives you feedback explaining that the repair treated a symptom rather than the root cause.

If you diagnose correctly and then choose the correct repair, you receive an additional bonus.

---

## Time and stability

Every incident begins with:

- **90 seconds**
- **100% stability**

Both matter.

### Time

The timer counts down continuously.

Investigation, diagnosis, incorrect repairs, and time itself consume seconds.

When the timer reaches zero, the system collapses and the incident is lost.

### Stability

Stability represents how close the simulated system is to becoming unrecoverable.

It decreases gradually while the incident is active.

Certain mistakes reduce it further.

A correct repair restores some stability.

If stability reaches zero before you resolve the incident, the system collapses.

This means you have to balance investigation with action. Spending all your time collecting information is not automatically better than making a decision.

---

## The run

TRACE//NULL is not just one incident.

Each run contains **five randomly selected incidents** from the ten-incident library.

Your score carries across the run.

Resolve an incident and continue to the next one.

Survive all five and the system is recovered.

The run then ends with a **POST-INCIDENT REPORT** showing your final score and run information.

You can start another run at any time. Because the five incidents are selected randomly, different runs can present a different sequence of failures.

---

## The incident library

The current version contains ten incidents:

| Incident | Core failure |
| --- | --- |
| **Queue Storm** | A worker retry policy loops failed jobs without a backoff limit. |
| **Database Lock** | A long-running transaction holds a database lock. |
| **Memory Leak** | A worker retains completed job objects and consumes increasing memory. |
| **Cache Poisoning** | Invalid configuration state has been written into the shared cache. |
| **Dependency Timeout** | A dependency timeout is larger than the request's available time budget. |
| **Retry Cascade** | Immediate retries multiply traffic when a dependency becomes slow. |
| **Connection Exhaustion** | Workers leak database connections instead of returning them to the pool. |
| **Config Drift** | One worker is running an outdated configuration. |
| **Dead Letter Flood** | A malformed producer continuously publishes invalid jobs. |
| **Circuit Breaker** | A circuit-breaker threshold is too sensitive to short dependency spikes. |

Each incident has its own:

- briefing;
- symptoms;
- hidden root cause;
- propagation path;
- investigation evidence;
- diagnosis choices;
- repair choices; and
- correct solution.

---

## A simple example

Imagine the game reports:

> **Requests are timing out. The worker fleet is saturated and the queue depth is climbing.**

You might see:

- high worker CPU;
- increasing queue depth;
- rising API latency.

Instead of immediately restarting the API Gateway, investigate.

If TRACE shows that failed jobs are returning to the worker, LOGS show the same job being retried repeatedly, and METRICS show an unusually high retry rate, you now have several independent clues pointing in the same direction.

You can then diagnose the incident as a **queue retry loop** and select the repair that disables unlimited retries.

The point is not memorizing that answer.

The point is learning to connect:

**symptom → evidence → root cause → repair**

---

## What makes a good run?

A strong run is not simply about clicking every tool.

You want to:

1. Read the incident briefing.
2. Identify the important symptoms.
3. Investigate the components involved.
4. Collect enough evidence to explain the failure.
5. Connect evidence from different tools.
6. Diagnose the underlying cause.
7. Choose the repair that addresses that cause.
8. Preserve as much time and stability as possible.
9. Repeat the process across five incidents.

You do **not** need prior production-engineering experience to play.

The interface gives you the evidence. The challenge is learning how to reason from it.

---

## Scoring

Your score reflects the quality of your investigation and recovery.

Points can come from:

- correct root-cause diagnosis;
- successful incident repair;
- using investigation tools;
- collecting evidence;
- remaining time;
- completing incidents efficiently.

Mistakes can reduce your score through:

- incorrect diagnoses;
- incorrect repairs;
- lost time;
- lost stability.

The final score is produced after the five-incident run.

---

## System model

The simulated system is intentionally small:

```
                    ┌─────────┐
                    │   API   │
                    │ Gateway │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         ┌─────────┐           ┌─────────┐
         │  Cache  │           │  Queue  │
         └─────────┘           └────┬────┘
                                    │
                                    ▼
                               ┌─────────┐
                               │ Worker  │
                               └────┬────┘
                                    │
                                    ▼
                               ┌─────────┐
                               │Database │
                               └─────────┘
```

The actual failure path changes from incident to incident.

That is why the system map, traces, logs, metrics, and dependency information are important.

---

## Architecture

TRACE//NULL is intentionally frontend-only.

There is no backend, database, authentication system, or external API required to play the game.

The project separates the game simulation from the browser interface:

- `src/game.ts` contains the incident library, game state, evidence, diagnosis rules, repair rules, scoring, stability, timer, and game-over logic.
- `src/main.ts` renders the interface and connects player actions to the simulation.
- `src/style.css` contains the responsive control-room interface.
- `src/game.test.ts` tests the core game rules.
- GitHub Actions validates the project and builds the production version.

Keeping the simulation separate from the interface makes the core rules testable without requiring a browser.

---

## Repository structure

```text
TRACE-NULL/
├── src/
│   ├── game.ts                 # game simulation and rules
│   ├── game.test.ts            # automated game tests
│   ├── main.ts                 # browser UI and game loop
│   └── style.css               # interface styling
├── .github/
│   └── workflows/
│       ├── ci.yml              # tests and production build
│       └── deploy-pages.yml    # GitHub Pages deployment
├── index.html                  # browser entry point
├── package.json                # scripts and dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md
```

---

## Technology

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Build tool | Vite |
| Testing | Vitest |
| Interface | HTML, CSS |
| Runtime | Browser |
| Deployment | GitHub Pages |
| CI | GitHub Actions |
| Backend | None |
| Database | None |
| External API | None |

The project deliberately keeps the infrastructure small because the engineering concept being demonstrated is the simulation and decision-making system itself.

---

## Run locally

The live version is the easiest way to play.

If you want to inspect the code or run your own development copy, clone the repository:

```bash
git clone https://github.com/Scarlet-Twinz/TRACE-NULL.git
cd TRACE-NULL
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local development address in the terminal. Open that address in a modern browser.

### Requirements

- Node.js 20 or newer
- npm
- A modern web browser

---

## Testing

Run the automated tests:

```bash
npm test
```

Create the production build:

```bash
npm run build
```

The project uses GitHub Actions to run the automated checks and validate the production build.

---

## Deployment

The production game is deployed as a static site through GitHub Pages.

**Live game:** https://scarlet-twinz.github.io/TRACE-NULL/

There is no server-side runtime required for the game.

---

## Design principles

### Evidence before assumptions

The player should have enough information to investigate a failure instead of simply guessing the intended answer.

### Symptoms are not causes

A visible failure may be several steps away from the original problem.

### Engineering concepts become mechanics

Queues, retries, dependencies, observability, resource exhaustion, propagation, diagnosis, and recovery are part of the gameplay rather than background terminology.

### Simulation and interface stay separate

The rules should remain testable independently from the browser presentation.

### Small scope, complete experience

TRACE//NULL is intentionally a compact game. It focuses on making one core mechanic—systems debugging—work well instead of adding unnecessary infrastructure.

---

## Why this project exists

Many software projects demonstrate applications by showing CRUD interfaces, APIs, dashboards, or database workflows.

TRACE//NULL explores a different question:

> **Can software-engineering reasoning itself become the gameplay?**

The project uses concepts found in real engineering work:

- observability;
- dependency graphs;
- event propagation;
- logs and metrics;
- queues and retries;
- resource exhaustion;
- state transitions;
- failure handling;
- root-cause analysis; and
- recovery.

The result is a small game that can be played by someone who has never worked in production engineering while still being recognizable to someone who has.

---

## Current status

**Version 2 — playable, tested, and deployed.**

The current release includes:

- ten incidents;
- five-incident randomized runs;
- four investigation tools;
- evidence collection;
- explicit root-cause diagnosis;
- diagnosis penalties and rewards;
- repair decisions;
- stability management;
- a 90-second incident timer;
- telemetry and system metrics;
- scoring;
- win and loss states;
- a final post-incident report;
- responsive control-room UI;
- automated tests;
- GitHub Actions CI; and
- GitHub Pages deployment.

---

## Future ideas

Possible future improvements include:

- sound effects;
- more advanced incident chains;
- accessibility improvements;
- keyboard shortcuts;
- additional difficulty modes;
- richer failure animations; and
- local high-score history.

These are future ideas, not requirements for the current version.

---

## Author

**Anthony Emmanuella Mmasinachi**

Full-stack and systems-focused developer building projects across web applications, backend systems, SaaS architecture, automation, AI integration, and practical software engineering.

## Project links

- **Repository:** https://github.com/Scarlet-Twinz/TRACE-NULL
- **Live game:** https://scarlet-twinz.github.io/TRACE-NULL/
- **GitHub:** https://github.com/Scarlet-Twinz


## License

MIT License.

See [LICENSE](LICENSE) for the full license text.