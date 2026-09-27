export type ComponentState = "healthy" | "degraded" | "failed";
export type Tool = "TRACE" | "LOGS" | "METRICS" | "DEPENDENCIES";
export type ActionResult = "success" | "wrong" | "already";

export interface Component {
  id: string;
  name: string;
  role: string;
  state: "healthy" | "degraded" | "failed";
  cpu: number;
  memory: number;
  latency: number;
  errors: number;
}

export interface Incident {
  id: string;
  title: string;
  briefing: string;
  rootCause: string;
  symptoms: string[];
  propagation: string[];
  evidence: Record<Tool, string[]>;
  fixes: string[];
  correctFix: string;
  diagnoses: string[];
  correctDiagnosis: string;
}

export interface GameState {
  incident: Incident;
  components: Component[];
  stability: number;
  score: number;
  time: number;
  usedTools: Tool[];
  evidence: string[];
  diagnosis: string | null;
  resolved: boolean;
  feedback: string;
  history: string[];
}

const BASE_COMPONENTS: Component[] = [
  { id:"gateway",name:"API Gateway",role:"traffic entry",state:"healthy",cpu:42,memory:48,latency:41,errors:1 },
  { id:"queue",name:"Job Queue",role:"async transport",state:"healthy",cpu:18,memory:31,latency:12,errors:0 },
  { id:"worker",name:"Worker",role:"background compute",state:"healthy",cpu:36,memory:44,latency:76,errors:2 },
  { id:"cache",name:"Cache",role:"fast state",state:"healthy",cpu:12,memory:37,latency:8,errors:0 },
  { id:"database",name:"Database",role:"persistent state",state:"healthy",cpu:34,memory:52,latency:43,errors:0 }
];

export const INCIDENTS: Incident[] = [
  {
    id: "queue-storm",
    title: "QUEUE STORM",
    briefing: "Requests are timing out. The worker fleet is saturated and the queue depth is climbing.",
    rootCause: "The worker retry policy is looping failed jobs without a backoff limit.",
    symptoms: ["queue depth rising", "worker CPU pinned", "API latency spiking"],
    propagation: ["Worker retry loop", "Queue saturation", "Gateway timeouts"],
    evidence: {
      TRACE: ["worker → queue traffic is looping", "failed jobs return to the same worker"],
      LOGS: ["retrying job id=8841", "retrying job id=8841", "retrying job id=8841"],
      METRICS: ["queue depth: 9,841", "worker CPU: 99%", "retry rate: 18/s"],
      DEPENDENCIES: ["Worker depends on Queue", "Gateway waits on Worker for async jobs"]
    },
    fixes: ["Disable unlimited retries", "Restart the API Gateway", "Flush the database"],
    correctFix: "Disable unlimited retries", diagnoses:["Database failure","Queue retry loop","Gateway overload","Worker memory leak"], correctDiagnosis:"Queue retry loop"
  },
  {
    id: "database-lock",
    title: "DATABASE LOCK",
    briefing: "Writes are backing up. Reads still work, but workers are waiting on a single transaction.",
    rootCause: "A long-running transaction is holding a database lock.",
    symptoms: ["write latency rising", "workers waiting", "read path healthy"],
    propagation: ["Open transaction", "Database lock", "Worker backlog"],
    evidence: {
      TRACE: ["worker → database edge is blocked", "read traffic remains healthy"],
      LOGS: ["waiting for lock on orders", "transaction age: 17m", "commit pending"],
      METRICS: ["write latency: 8.4s", "read latency: 41ms", "lock waiters: 14"],
      DEPENDENCIES: ["Worker writes to Database", "Gateway reads cached state"]
    },
    fixes: ["Terminate the long transaction", "Restart the Gateway", "Clear the cache"],
    correctFix: "Terminate the long transaction", diagnoses:["Database lock","Queue retry loop","Cache poisoning","Gateway overload"], correctDiagnosis:"Database lock"
  },
  {
    id: "memory-leak",
    title: "MEMORY LEAK",
    briefing: "The worker is becoming unstable after every batch. Restarts temporarily hide the problem.",
    rootCause: "The worker retains completed job objects in an in-memory history array.",
    symptoms: ["heap usage rising", "GC pauses increasing", "worker restarts"],
    propagation: ["Retained objects", "Heap growth", "GC pressure", "Worker crash"],
    evidence: {
      TRACE: ["worker owns a growing history buffer", "no matching growth in queue depth"],
      LOGS: ["heap 612MB", "heap 704MB", "heap 811MB"],
      METRICS: ["heap: 92%", "GC pause: 840ms", "queue depth: normal"],
      DEPENDENCIES: ["Worker memory is local", "Queue remains healthy"]
    },
    fixes: ["Clear retained job history", "Restart the database", "Increase gateway timeout"],
    correctFix: "Clear retained job history", diagnoses:["Worker memory leak","Database lock","Dependency timeout","Cache poisoning"], correctDiagnosis:"Worker memory leak"
  },
  {
    id: "cache-poisoning",
    title: "CACHE POISONING",
    briefing: "Users are receiving stale configuration. The database contains the current value.",
    rootCause: "An invalid configuration object was written into the shared cache.",
    symptoms: ["stale config", "cache hits normal", "database current"],
    propagation: ["Bad cache write", "Stale reads", "Incorrect behavior"],
    evidence: {
      TRACE: ["Gateway reads Cache before Database", "Cache is the divergent state"],
      LOGS: ["config version=17", "cache version=12", "cache hit=true"],
      METRICS: ["cache hit rate: 98%", "database errors: 0", "config mismatch: 100%"],
      DEPENDENCIES: ["Gateway → Cache", "Cache fallback → Database"]
    },
    fixes: ["Invalidate the poisoned cache key", "Restart the worker", "Scale the queue"],
    correctFix: "Invalidate the poisoned cache key", diagnoses:["Cache poisoning","Database lock","Gateway overload","Queue retry loop"], correctDiagnosis:"Cache poisoning"
  },
  {
    id: "dependency-timeout",
    title: "DEPENDENCY TIMEOUT",
    briefing: "The gateway is healthy, but requests to the payment dependency are taking too long.",
    rootCause: "The payment dependency timeout was set far above the request budget.",
    symptoms: ["request duration spikes", "gateway threads occupied", "payment calls slow"],
    propagation: ["Slow dependency", "Long-held requests", "Gateway saturation"],
    evidence: {
      TRACE: ["gateway → payment dependency is the slow edge", "database path is normal"],
      LOGS: ["payment request elapsed=29s", "timeout=30s", "request budget=5s"],
      METRICS: ["gateway concurrency: 96%", "payment p95: 27s", "database p95: 43ms"],
      DEPENDENCIES: ["Gateway calls Payment", "Payment is outside the database path"]
    },
    fixes: ["Reduce payment timeout to the request budget", "Flush the cache", "Restart the database"],
    correctFix: "Reduce payment timeout to the request budget", diagnoses:["Dependency timeout","Database lock","Queue retry loop","Worker memory leak"], correctDiagnosis:"Dependency timeout"
  },
  {
    id:"retry-cascade",title:"RETRY CASCADE",briefing:"A slow dependency causes retries to multiply.",rootCause:"The client retries every failed call immediately with no cap.",symptoms:["Slow dependency","Immediate retries","Traffic multiplication"],propagation:["Slow dependency","Immediate retries","Traffic multiplication","Gateway saturation"],evidence:{TRACE:["gateway emits repeated calls","retry traffic exceeds user traffic"],LOGS:["retry attempt=9","retry attempt=10"],METRICS:["retry rate: 41/s","gateway concurrency: 97%"],DEPENDENCIES:["Gateway calls dependency","Retries originate at Gateway"]},fixes:["Add bounded exponential backoff","Restart the database","Clear the cache"],correctFix:"Add bounded exponential backoff",diagnoses:["Retry cascade","Database lock","Cache poisoning","Memory leak"],correctDiagnosis:"Retry cascade"
  },
  {
    id:"connection-exhaustion",title:"CONNECTION EXHAUSTION",briefing:"Database requests are waiting for connections.",rootCause:"Workers open database connections without returning them.",symptoms:["Leaked connections","Pool exhaustion","Worker wait"],propagation:["Leaked connections","Pool exhaustion","Worker wait"],evidence:{TRACE:["worker opens database connections","connections never return"],LOGS:["pool active=100","pool idle=0"],METRICS:["pool usage: 100%","waiters: 27"],DEPENDENCIES:["Worker → Database","Database pool is shared"]},fixes:["Return connections to the pool","Restart the Gateway","Invalidate the cache"],correctFix:"Return connections to the pool",diagnoses:["Connection exhaustion","Database lock","Queue retry loop","Dependency timeout"],correctDiagnosis:"Connection exhaustion"
  },
  {
    id:"config-drift",title:"CONFIG DRIFT",briefing:"One worker behaves differently after deployment.",rootCause:"The worker is running an outdated configuration value.",symptoms:["Old config","Different behavior","Partial failure"],propagation:["Old config","Different behavior","Partial failure"],evidence:{TRACE:["one worker differs from peers","gateway routes to both versions"],LOGS:["worker-a config=v18","worker-b config=v17"],METRICS:["worker-a errors: 1%","worker-b errors: 42%"],DEPENDENCIES:["Gateway distributes to workers","Workers should share config"]},fixes:["Reload the worker configuration","Flush the database","Scale the queue"],correctFix:"Reload the worker configuration",diagnoses:["Config drift","Memory leak","Cache poisoning","Database lock"],correctDiagnosis:"Config drift"
  },
  {
    id:"dead-letter-flood",title:"DEAD LETTER FLOOD",briefing:"Invalid jobs are filling the dead-letter queue.",rootCause:"A malformed producer continuously publishes invalid payloads.",symptoms:["Malformed producer","Rejected jobs","Dead-letter growth"],propagation:["Malformed producer","Rejected jobs","Dead-letter growth","Storage pressure"],evidence:{TRACE:["producer → queue payload is malformed","consumer rejects before processing"],LOGS:["schema validation failed","dead-lettered job=7721"],METRICS:["DLQ depth: 12440","storage: 88%"],DEPENDENCIES:["Producer writes Queue","Consumer validates jobs"]},fixes:["Stop the malformed producer","Restart the database","Increase gateway timeout"],correctFix:"Stop the malformed producer",diagnoses:["Dead-letter flood","Queue retry loop","Database lock","Cache poisoning"],correctDiagnosis:"Dead-letter flood"
  },
  {
    id:"circuit-breaker",title:"CIRCUIT BREAKER",briefing:"The gateway opened its circuit during a short dependency spike.",rootCause:"The circuit breaker threshold is too sensitive.",symptoms:["Latency spike","Circuit opens","Fallback path"],propagation:["Latency spike","Circuit opens","Fallback path","User errors"],evidence:{TRACE:["gateway bypasses dependency","fallback path carries traffic"],LOGS:["circuit=open","threshold=5%"],METRICS:["dependency p95: 2.1s","fallback traffic: 71%"],DEPENDENCIES:["Gateway → Dependency","Gateway → Fallback"]},fixes:["Tune the circuit threshold and recovery window","Clear the cache","Restart the database"],correctFix:"Tune the circuit threshold and recovery window",diagnoses:["Circuit breaker","Dependency timeout","Gateway overload","Cache poisoning"],correctDiagnosis:"Circuit breaker"
  }
];

export function createGame(incident = INCIDENTS[0]): GameState {
  return {
    incident,
    components: BASE_COMPONENTS.map((component) => ({ ...component })),
    stability: 100,
    score: 0,
    time: 90,
    usedTools: [],
    evidence: [],
    diagnosis: null,
    resolved: false,
    feedback: "Incident detected. Find the root cause.",
    history: ["SYSTEM: incident detected", `ALERT: ${incident.title}`]
  };
}

export function useTool(state: GameState, tool: Tool): GameState {
  if (state.resolved) return state;
  const firstUse = !state.usedTools.includes(tool);
  return {
    ...state,
    usedTools: firstUse ? [...state.usedTools, tool] : state.usedTools,
    evidence: [...new Set([...state.evidence, ...state.incident.evidence[tool]])],
    time: Math.max(0, state.time - (firstUse ? 4 : 1)),
    stability: Math.max(0, state.stability - (firstUse ? 1 : 0)),
    feedback: state.incident.evidence[tool].join(" • "),
    history: [...state.history, `TOOL ${tool}: evidence revealed`]
  };
}

export function submitDiagnosis(state: GameState, diagnosis: string): GameState {
  if (state.resolved || isGameOver(state)) return state;
  if (diagnosis === state.incident.correctDiagnosis) return { ...state, diagnosis, score: state.score + 100, time: Math.max(0,state.time-2), feedback:"DIAGNOSIS CONFIRMED — root cause identified.", history:[...state.history, `DIAGNOSIS CONFIRMED: ${diagnosis}`] };
  return { ...state, diagnosis, score:Math.max(0,state.score-35), stability:Math.max(0,state.stability-10), time:Math.max(0,state.time-5), feedback:"Diagnosis rejected. Keep tracing the evidence.", history:[...state.history, `DIAGNOSIS REJECTED: ${diagnosis}`] };
}

export function applyFix(state: GameState, fix: string): GameState {
  if (state.resolved) return state;
  if (fix === state.incident.correctFix) {
    const next = {
      ...state,
      resolved: true,
      stability: Math.min(100, state.stability + 15),
      score: state.score + 100 + (state.diagnosis === state.incident.correctDiagnosis ? 50 : 0) + state.usedTools.length * 10 + state.time,
      feedback: `ROOT CAUSE CONFIRMED — ${state.incident.rootCause}`,
      history: [...state.history, `FIX APPLIED: ${fix}`, "SYSTEM: incident resolved"]
    };
    return next;
  }
  return {
    ...state,
    stability: Math.max(0, state.stability - 15),
    time: Math.max(0, state.time - 8),
    score: Math.max(0, state.score - 20),
    feedback: "That repair treats a symptom, not the root cause.",
    history: [...state.history, `BAD FIX: ${fix}`]
  };
}

export function tick(state: GameState, seconds = 1): GameState {
  if (state.resolved || state.time <= 0 || state.stability <= 0) return state;
  const nextStability = Math.max(0, state.stability - seconds * 0.35);
  const nextTime = Math.max(0, state.time - seconds);
  return {
    ...state,
    stability: nextStability,
    time: nextTime,
    feedback: nextTime === 0 || nextStability === 0 ? "SYSTEM COLLAPSED — restart the incident." : state.feedback
  };
}

export function isGameOver(state: GameState): boolean {
  return !state.resolved && (state.time <= 0 || state.stability <= 0);
}
