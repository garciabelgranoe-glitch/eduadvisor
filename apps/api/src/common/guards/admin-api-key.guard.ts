import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ADMIN_SCOPES_KEY, AdminScope } from "./admin-scope.decorator";

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const incoming = this.getHeaderValue(request.headers, "x-admin-key");
    const requiredScopes =
      this.reflector.getAllAndOverride<AdminScope[]>(ADMIN_SCOPES_KEY, [context.getHandler(), context.getClass()]) ??
      ["write"];
    const grantedScopes = this.resolveScopesForKey(incoming);

    if (grantedScopes.length === 0) {
      throw new UnauthorizedException("Invalid admin api key");
    }

    const hasRequiredScope = requiredScopes.every((scope) => grantedScopes.includes(scope));
    if (!hasRequiredScope) {
      throw new ForbiddenException("Insufficient admin scope");
    }

    return true;
  }

  private resolveScopesForKey(incoming: string | undefined): AdminScope[] {
    if (!incoming) {
      return [];
    }

    const fullAccessKey = process.env.ADMIN_API_KEY?.trim();
    const readOnlyKey = process.env.ADMIN_READ_API_KEY?.trim();
    const writeOnlyKey = process.env.ADMIN_WRITE_API_KEY?.trim();

    if (fullAccessKey && incoming === fullAccessKey) {
      return ["read", "write"];
    }

    if (readOnlyKey && incoming === readOnlyKey) {
      return ["read"];
    }

    if (writeOnlyKey && incoming === writeOnlyKey) {
      return ["write"];
    }

    return [];
  }

  private getHeaderValue(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
