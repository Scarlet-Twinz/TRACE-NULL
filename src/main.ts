import "./style.css";
import { INCIDENTS, applyFix, createGame, isGameOver, tick, useTool, type GameState, type Tool } from "./game";

let state = createGame();
let timer: number | undefined;

const app = document.querySelector<HTMLDivElement>("#app")!;

const toolLabels: Tool[] = ["TRACE", "LOGS", "METRICS", "DEPENDENCIES"];

function render() {
  const gameOver = isGameOver(state);
  const componentMarkup = state.components.map((component) => `
    <div class="node node-${component.state}">
      <span class="node-dot"></span>
      <div><strong>${component.name}</strong><small>${component.role}</small></div>
    </div>`).join("");

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand"><span>TRACE</span><b>//</b><span>NULL</span></div>
        <div class="status"><span class="pulse"></span> LIVE INCIDENT</div>
        <button class="restart" data-action="restart">RESTART</button>
      </header>

      <section class="hero">
        <div>
          <p class="eyebrow">PRODUCTION / SIMULATION-07</p>
          <h1>${state.incident.title}</h1>
          <p class="briefing">${state.incident.briefing}</p>
        </div>
        <div class="stats">
          <div><span>STABILITY</span><strong class="${state.stability < 35 ? "danger" : ""}">${Math.round(state.stability)}%</strong></div>
          <div><span>TIME</span><strong class="${state.time < 20 ? "danger" : ""}">${state.time}s</strong></div>
          <div><span>SCORE</span><strong>${Math.round(state.score)}</strong></div>
        </div>
      </section>

      <section class="layout">
        <div class="panel system-panel">
          <div class="panel-title"><span>SYSTEM TOPOLOGY</span><em>dependency graph</em></div>
          <div class="topology">${componentMarkup}</div>
          <div class="chain">${state.incident.propagation.map((item, i) => `<span>${item}</span>${i < state.incident.propagation.length - 1 ? "<b>→</b>" : ""}`).join("")}</div>
        </div>

        <div class="panel evidence-panel">
          <div class="panel-title"><span>INVESTIGATION</span><em>${state.usedTools.length}/4 tools used</em></div>
          <div class="tools">${toolLabels.map((tool) => `<button class="tool ${state.usedTools.includes(tool) ? "used" : ""}" data-tool="${tool}"><b>${tool}</b><small>inspect evidence</small></button>`).join("")}</div>
          <div class="feedback"><span>&gt;</span> ${state.feedback}</div>
          <div class="logs">${state.history.slice(-7).map((line) => `<div>${line}</div>`).join("")}</div>
        </div>
      </section>

      <section class="panel repair-panel">
        <div class="panel-title"><span>REPAIR CONSOLE</span><em>choose carefully</em></div>
        <div class="fixes">${state.incident.fixes.map((fix) => `<button class="fix" data-fix="${fix}" ${state.resolved || gameOver ? "disabled" : ""}>${fix}<span>↗</span></button>`).join("")}</div>
        ${state.resolved ? '<div class="result success">✓ INCIDENT RESOLVED — SYSTEM STABILIZED</div>' : gameOver ? '<div class="result fail">× SYSTEM COLLAPSED — TRACE LOST</div>' : ""}
      </section>

      <footer>TRACE//NULL <span>debug the system, not the symptom.</span></footer>
    </main>`;

  document.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach((button) => {
    button.onclick = () => {
      state = useTool(state, button.dataset.tool as Tool);
      render();
    };
  });

  document.querySelectorAll<HTMLButtonElement>("[data-fix]").forEach((button) => {
    button.onclick = () => {
      state = applyFix(state, button.dataset.fix!);
      render();
    };
  });

  document.querySelector<HTMLButtonElement>("[data-action=restart]")!.onclick = () => {
    state = createGame(INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)]);
    startTimer();
    render();
  };
}

function startTimer() {
  if (timer) window.clearInterval(timer);
  timer = window.setInterval(() => {
    const next = tick(state);
    if (next !== state) {
      state = next;
      render();
    }
    if (isGameOver(state) || state.resolved) {
      window.clearInterval(timer);
    }
  }, 1000);
}

render();
startTimer();
