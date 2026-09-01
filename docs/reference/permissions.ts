export type WebbPermissionState =
  | "not-requested"
  | "prompt"
  | "granted"
  | "denied"
  | "restricted"
  | "unsupported"
  | "unavailable";

export type WebbPermissionResult = Readonly<{
  name: string;
  status:
    | "granted"
    | "denied"
    | "dismissed"
    | "restricted"
    | "unsupported"
    | "unavailable"
    | "not-declared";
}>;

export type PermissionDeclaration = Readonly<{
  required: boolean;
  reason: string;
}>;

export type PermissionPrompt = (
  name: string,
  declaration: PermissionDeclaration,
) => Promise<"granted" | "denied" | "dismissed">;

export type PermissionsApi = Readonly<{
  status(name: string): WebbPermissionState;
  request(name: string): Promise<WebbPermissionResult>;
  reset(name?: string): void;
}>;

export const createPermissionsApi = (
  declarations: Readonly<Record<string, PermissionDeclaration>>,
  prompt: PermissionPrompt,
): PermissionsApi => {
  const states = new Map<string, WebbPermissionState>();
  Object.keys(declarations).forEach((name) =>
    states.set(name, "not-requested"),
  );

  const request = async (name: string): Promise<WebbPermissionResult> => {
    const declaration = declarations[name];
    if (!declaration) return Object.freeze({ name, status: "not-declared" });

    const current = states.get(name);
    if (current === "granted" || current === "denied") {
      return Object.freeze({ name, status: current });
    }

    states.set(name, "prompt");
    try {
      const outcome = await prompt(name, declaration);
      const status = outcome === "dismissed" ? "not-requested" : outcome;
      states.set(name, status);
      return Object.freeze({ name, status: outcome });
    } catch (error) {
      states.set(name, "not-requested");
      throw error;
    }
  };

  return Object.freeze({
    status: (name: string) => states.get(name) ?? "unsupported",
    request,
    reset: (name?: string) => {
      if (name) {
        if (declarations[name]) states.set(name, "not-requested");
        return;
      }
      states.forEach((_, permissionName) =>
        states.set(permissionName, "not-requested"),
      );
    },
  });
};
