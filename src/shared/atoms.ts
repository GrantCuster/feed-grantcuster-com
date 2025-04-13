import { atomWithStorage } from "jotai/utils";

export const adminPasswordAtom = atomWithStorage<string | null>(
  "adminPassword",
  null,
);
