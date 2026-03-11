import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { AuthService } from "./auth.service";
import { CreateAuthSessionDto } from "./dto/create-auth-session.dto";
import { GetSchoolClaimStatusDto } from "./dto/get-school-claim-status.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("session")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async createSession(@Body() payload: CreateAuthSessionDto) {
    return this.authService.createSession(payload);
  }

  @Get("school-claim-status")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async getSchoolClaimStatus(@Query() query: GetSchoolClaimStatusDto) {
    return this.authService.getSchoolClaimStatus(query);
  }
}
