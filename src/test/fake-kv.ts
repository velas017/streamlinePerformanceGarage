/**
 * In-memory stand-in for the Redis commands the site sends through lib/kv.ts,
 * so the admin sign-in rules can be tested end to end without a network. It
 * follows Redis's replies (integers for counts, null for a missing key) and
 * expires keys against the clock it is given, so fake timers move it.
 */
type Stored = string | Set<string> | string[];

interface Entry {
  value: Stored;
  expiresAt: number | null;
}

export type KvArg = string | number;

export interface FakeKv {
  exec(args: readonly KvArg[]): unknown;
  /** Every live key, for assertions about what is (not) stored. */
  keys(): string[];
  /** Every live key and value as one string, to prove a secret is not in the store. */
  dump(): string;
  clear(): void;
}

export function createFakeKv(now: () => number = Date.now): FakeKv {
  const data = new Map<string, Entry>();

  function live(key: string): Entry | undefined {
    const entry = data.get(key);
    if (entry && entry.expiresAt !== null && entry.expiresAt <= now()) {
      data.delete(key);
      return undefined;
    }
    return entry;
  }

  function collection<T extends Set<string> | string[]>(
    key: string,
    create: () => T,
    is: (value: Stored) => value is T,
  ): T {
    const entry = live(key);
    if (entry && is(entry.value)) return entry.value;
    const value = create();
    data.set(key, { value, expiresAt: null });
    return value;
  }

  const isSet = (value: Stored): value is Set<string> => value instanceof Set;
  const isList = (value: Stored): value is string[] => Array.isArray(value);
  const text = (key: string): string | null => {
    const value = live(key)?.value;
    return typeof value === "string" ? value : null;
  };

  function exec(args: readonly KvArg[]): unknown {
    const [command, ...rest] = args.map(String);
    const [key = "", ...values] = rest;
    switch (command?.toUpperCase()) {
      case "GET":
        return text(key);
      case "MGET":
        return rest.map(text);
      case "GETDEL": {
        const value = text(key);
        data.delete(key);
        return value;
      }
      case "SET": {
        const ex = values.findIndex((value) => value.toUpperCase() === "EX");
        const seconds = ex >= 0 ? Number(values[ex + 1]) : null;
        data.set(key, {
          value: values[0] ?? "",
          expiresAt: seconds === null ? null : now() + seconds * 1000,
        });
        return "OK";
      }
      case "DEL":
        return rest.filter((name) => {
          const existed = live(name) !== undefined;
          data.delete(name);
          return existed;
        }).length;
      case "INCR": {
        const entry = live(key);
        const next = Number(typeof entry?.value === "string" ? entry.value : 0) + 1;
        data.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
        return next;
      }
      case "EXPIRE": {
        const entry = live(key);
        if (!entry) return 0;
        entry.expiresAt = now() + Number(values[0]) * 1000;
        return 1;
      }
      case "TTL": {
        const entry = live(key);
        if (!entry) return -2;
        return entry.expiresAt === null
          ? -1
          : Math.ceil((entry.expiresAt - now()) / 1000);
      }
      case "SADD": {
        const set = collection(key, () => new Set<string>(), isSet);
        const before = set.size;
        values.forEach((value) => set.add(value));
        return set.size - before;
      }
      case "SREM": {
        const set = collection(key, () => new Set<string>(), isSet);
        return values.filter((value) => set.delete(value)).length;
      }
      case "SMEMBERS":
        return [...collection(key, () => new Set<string>(), isSet)];
      case "LPUSH": {
        const list = collection(key, () => [] as string[], isList);
        values.forEach((value) => list.unshift(value));
        return list.length;
      }
      case "LTRIM": {
        const list = collection(key, () => [] as string[], isList);
        const kept = list.slice(Number(values[0]), Number(values[1]) + 1);
        list.length = 0;
        list.push(...kept);
        return "OK";
      }
      case "LRANGE":
        return collection(key, () => [] as string[], isList).slice(
          Number(values[0]),
          Number(values[1]) + 1,
        );
      default:
        throw new Error(`fake KV: unsupported command ${String(command)}`);
    }
  }

  return {
    exec,
    keys: () => [...data.keys()].filter((key) => live(key) !== undefined),
    dump: () =>
      [...data.keys()]
        .map((key) => {
          const value = live(key)?.value;
          const shown = value instanceof Set ? [...value] : value;
          return `${key}=${JSON.stringify(shown)}`;
        })
        .join("\n"),
    clear: () => data.clear(),
  };
}
