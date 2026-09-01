export type WebbStorageClass = "session" | "app" | "cache" | "secure";

export type StorageApi = Readonly<{
  get<T>(key: string, storageClass?: WebbStorageClass): Promise<T | undefined>;
  set<T>(key: string, value: T, storageClass?: WebbStorageClass): Promise<void>;
  remove(key: string, storageClass?: WebbStorageClass): Promise<void>;
  clear(storageClass?: WebbStorageClass): Promise<void>;
  usage(storageClass?: WebbStorageClass): number;
  endSession(): void;
}>;

export type StorageOptions = Partial<Record<WebbStorageClass, number>>;

export const DEFAULT_STORAGE_QUOTAS: Readonly<
  Record<WebbStorageClass, number>
> = Object.freeze({
  session: 1 * 1024 * 1024,
  app: 5 * 1024 * 1024,
  cache: 25 * 1024 * 1024,
  secure: 256 * 1024,
});

const valueSize = (value: unknown): number =>
  (JSON.stringify(value)?.length ?? 0) * 2;

export const createStorageApi = (quotas: StorageOptions = {}): StorageApi => {
  const stores = new Map<WebbStorageClass, Map<string, unknown>>();
  const limits = { ...DEFAULT_STORAGE_QUOTAS, ...quotas };
  const classes: WebbStorageClass[] = ["session", "app", "cache", "secure"];
  classes.forEach((storageClass) => stores.set(storageClass, new Map()));

  const resolveClass = (storageClass: WebbStorageClass): Map<string, unknown> =>
    stores.get(storageClass) as Map<string, unknown>;

  const usage = (storageClass: WebbStorageClass): number =>
    [...resolveClass(storageClass)].reduce(
      (total, [key, value]) => total + valueSize(key) + valueSize(value),
      0,
    );

  const clear = async (storageClass?: WebbStorageClass): Promise<void> => {
    if (storageClass) {
      resolveClass(storageClass).clear();
      return;
    }
    classes.forEach((name) => resolveClass(name).clear());
  };

  return Object.freeze({
    get: async <T>(key: string, storageClass: WebbStorageClass = "app") =>
      resolveClass(storageClass).get(key) as T | undefined,
    set: async <T>(
      key: string,
      value: T,
      storageClass: WebbStorageClass = "app",
    ) => {
      const store = resolveClass(storageClass);
      const previous = store.get(key);
      store.set(key, value);
      if (usage(storageClass) > limits[storageClass]) {
        if (previous === undefined) store.delete(key);
        else store.set(key, previous);
        throw new Error("STORAGE_QUOTA_EXCEEDED");
      }
    },
    remove: async (key: string, storageClass: WebbStorageClass = "app") => {
      resolveClass(storageClass).delete(key);
    },
    clear,
    usage,
    endSession: () => {
      resolveClass("session").clear();
    },
  });
};
