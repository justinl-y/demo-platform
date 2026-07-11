// Central registry of the permission strings the app checks, defined once so usages stay in sync.
export const PERMISSIONS = {
  INTERNAL_ROLES_READ: 'INTERNAL_ROLES_READ',
  INTERNAL_ROLES_WRITE: 'INTERNAL_ROLES_WRITE',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Menu key -> permission required to enable it. Items without an entry are always enabled; add a row
// here as permission-gated pages come online. `Partial` models the map as having optional keys, so
// indexing an unlisted key is typed as possibly-undefined — the absence check stays honest without
// relying on `noUncheckedIndexedAccess`.
export const PERMISSION_BY_KEY: Partial<Record<string, Permission>> = {
  roles: PERMISSIONS.INTERNAL_ROLES_READ,
};
