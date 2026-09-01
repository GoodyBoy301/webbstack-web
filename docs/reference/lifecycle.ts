export type WebbLifecycleState =
  | "created"
  | "booting"
  | "active"
  | "backgrounded"
  | "suspended"
  | "stopped"
  | "terminated";

export type WebbLifecycleEvent =
  | { type: "runtime:created"; timestamp: number }
  | { type: "app:booting"; timestamp: number }
  | { type: "app:ready"; timestamp: number; view: string }
  | { type: "app:background"; timestamp: number; reason: string }
  | { type: "app:foreground"; timestamp: number }
  | { type: "app:suspend"; timestamp: number }
  | { type: "app:resume"; timestamp: number }
  | { type: "app:stop"; timestamp: number; reason: string }
  | { type: "app:terminate"; timestamp: number; reason: string }
  | { type: "app:clear-data"; timestamp: number };

export type LifecycleApi = Readonly<{
  state(): WebbLifecycleState;
  on(listener: (event: WebbLifecycleEvent) => void): () => void;
  boot(): void;
  ready(input: { view: string }): void;
  background(reason: string): void;
  foreground(): void;
  suspend(): void;
  resume(): void;
  stop(reason: string): void;
  terminate(reason: string): void;
  clearData(): void;
}>;

type LifecycleEventType = WebbLifecycleEvent["type"];

const transitions: Readonly<Record<LifecycleEventType, WebbLifecycleState>> = {
  "runtime:created": "created",
  "app:booting": "booting",
  "app:ready": "active",
  "app:background": "backgrounded",
  "app:foreground": "active",
  "app:suspend": "suspended",
  "app:resume": "active",
  "app:stop": "stopped",
  "app:terminate": "terminated",
  "app:clear-data": "active",
};

export const createLifecycleApi = (
  now: () => number = Date.now,
): LifecycleApi => {
  let currentState: WebbLifecycleState = "created";
  const listeners = new Set<(event: WebbLifecycleEvent) => void>();

  const emit = (event: WebbLifecycleEvent): void => {
    currentState = transitions[event.type];
    listeners.forEach((listener) => listener(Object.freeze(event)));
  };

  const transition = (
    event: WebbLifecycleEvent,
    allowedStates: readonly WebbLifecycleState[],
  ): void => {
    if (!allowedStates.includes(currentState)) {
      throw new Error(`Invalid lifecycle transition from ${currentState}`);
    }
    emit(event);
  };

  const timestamp = (): number => now();

  return Object.freeze({
    state: () => currentState,
    on: (listener: (event: WebbLifecycleEvent) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    boot: () =>
      transition(
        { type: "app:booting", timestamp: timestamp() },
        ["created"],
      ),
    ready: ({ view }: { view: string }) =>
      transition(
        { type: "app:ready", timestamp: timestamp(), view },
        ["booting"],
      ),
    background: (reason: string) =>
      transition(
        { type: "app:background", timestamp: timestamp(), reason },
        ["active"],
      ),
    foreground: () =>
      transition(
        { type: "app:foreground", timestamp: timestamp() },
        ["backgrounded"],
      ),
    suspend: () =>
      transition(
        { type: "app:suspend", timestamp: timestamp() },
        ["backgrounded", "active"],
      ),
    resume: () =>
      transition(
        { type: "app:resume", timestamp: timestamp() },
        ["suspended"],
      ),
    stop: (reason: string) =>
      transition(
        { type: "app:stop", timestamp: timestamp(), reason },
        ["active", "backgrounded", "suspended"],
      ),
    terminate: (reason: string) =>
      transition(
        { type: "app:terminate", timestamp: timestamp(), reason },
        ["active", "backgrounded", "suspended", "stopped"],
      ),
    clearData: () =>
      transition(
        { type: "app:clear-data", timestamp: timestamp() },
        ["active", "backgrounded", "suspended", "stopped"],
      ),
  });
};
