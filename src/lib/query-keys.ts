export const queryKeys = {
  me: ["me"] as const,
  accounts: {
    all: ["accounts"] as const,
    list: () => ["accounts", "list"] as const,
  },
  credentials: ["youtube", "credentials"] as const,
  storage: {
    all: ["storage"] as const,
    list: (params: unknown) => ["storage", "list", params] as const,
  },
  uploads: {
    all: ["uploads"] as const,
    list: (params: unknown) => ["uploads", "list", params] as const,
    detail: (id: string) => ["uploads", "detail", id] as const,
    quota: () => ["uploads", "quota"] as const,
  },
  health: ["health"] as const,
};