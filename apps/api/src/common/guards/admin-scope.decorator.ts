import { SetMetadata } from "@nestjs/common";

export type AdminScope = "read" | "write";

export const ADMIN_SCOPES_KEY = "adminScopes";

export const AdminScopes = (...scopes: AdminScope[]) => SetMetadata(ADMIN_SCOPES_KEY, scopes);
