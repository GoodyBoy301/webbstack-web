export type WebbRuntimeMode = "preview" | "public" | "embed" | "development";

export type WebbCapabilityPermission =
  "not-requested" | "prompt" | "granted" | "denied" | "restricted";

export type WebbCapabilityAvailability =
  "available" | "unavailable" | "restricted";

export type WebbCapabilityStatus = Readonly<{
  name: string;
  supported: boolean;
  enabled: boolean;
  availability: WebbCapabilityAvailability;
  requiresPermission: boolean;
  permission: WebbCapabilityPermission;
  version: string;
}>;

export type WebbRuntimeInfo = Readonly<{
  formatVersion: string;
  runtimeVersion: string;
  mode: WebbRuntimeMode;
  appId: string;
  appVersion: string;
  buildId: string;
  sessionId: string;
  capabilities: readonly WebbCapabilityStatus[];
}>;

export type RuntimeApi = Readonly<{
  info(): WebbRuntimeInfo;
  capabilities(): readonly WebbCapabilityStatus[];
  capability(name: string): WebbCapabilityStatus | undefined;
  canUse(name: string): boolean;
}>;

export type RuntimeInfoInput = {
  formatVersion: string;
  runtimeVersion: string;
  mode: WebbRuntimeMode;
  appId: string;
  appVersion: string;
  buildId: string;
  sessionId: string;
  capabilities: readonly WebbCapabilityStatus[];
};

const freezeCapability = (
  capability: WebbCapabilityStatus,
): WebbCapabilityStatus => Object.freeze({ ...capability });

const freezeRuntimeInfo = (input: RuntimeInfoInput): WebbRuntimeInfo => {
  const capabilities = Object.freeze(input.capabilities.map(freezeCapability));

  return Object.freeze({
    formatVersion: input.formatVersion,
    runtimeVersion: input.runtimeVersion,
    mode: input.mode,
    appId: input.appId,
    appVersion: input.appVersion,
    buildId: input.buildId,
    sessionId: input.sessionId,
    capabilities,
  });
};

export const createRuntimeApi = (input: RuntimeInfoInput): RuntimeApi => {
  const info = freezeRuntimeInfo(input);
  const capabilityIndex = new Map(
    info.capabilities.map((capability) => [capability.name, capability]),
  );

  if (capabilityIndex.size !== info.capabilities.length) {
    throw new Error("Runtime capability names must be unique");
  }

  return Object.freeze({
    info: () => info,
    capabilities: () => info.capabilities,
    capability: (name: string) => capabilityIndex.get(name),
    canUse: (name: string) => {
      const capability = capabilityIndex.get(name);
      return Boolean(
        capability?.supported &&
        capability.enabled &&
        capability.availability === "available" &&
        (!capability.requiresPermission || capability.permission === "granted"),
      );
    },
  });
};
