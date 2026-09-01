export type NavigationState = Readonly<{
  current: string;
  stack: readonly string[];
}>;

export type NavigationApi = Readonly<{
  state(): NavigationState;
  onChange(listener: (state: NavigationState) => void): () => void;
  push(destination: string): void;
  replace(destination: string): void;
  back(): boolean;
  reset(destination?: string): void;
}>;

export type NavigationInput = {
  initialView: string;
  fallbackView?: string;
  destinations: readonly string[];
};

const freezeState = (stack: readonly string[]): NavigationState => {
  const snapshot = Object.freeze([...stack]);
  return Object.freeze({
    current: snapshot[snapshot.length - 1],
    stack: snapshot,
  });
};

export const createNavigationApi = (
  input: NavigationInput,
): NavigationApi => {
  const destinations = new Set(input.destinations);
  const fallback = input.fallbackView ?? input.initialView;

  if (!destinations.has(input.initialView)) {
    throw new Error(`Unknown initial view: ${input.initialView}`);
  }
  if (!destinations.has(fallback)) {
    throw new Error(`Unknown fallback view: ${fallback}`);
  }

  let stack = [input.initialView];
  const listeners = new Set<(state: NavigationState) => void>();

  const destination = (name: string): string =>
    destinations.has(name) ? name : fallback;

  const publish = (): void => {
    const state = freezeState(stack);
    listeners.forEach((listener) => listener(state));
  };

  const update = (nextStack: string[]): void => {
    stack = nextStack;
    publish();
  };

  return Object.freeze({
    state: () => freezeState(stack),
    onChange: (listener: (state: NavigationState) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    push: (name: string) => update([...stack, destination(name)]),
    replace: (name: string) =>
      update([...stack.slice(0, -1), destination(name)]),
    back: () => {
      if (stack.length === 1) return false;
      update(stack.slice(0, -1));
      return true;
    },
    reset: (name = input.initialView) => update([destination(name)]),
  });
};
