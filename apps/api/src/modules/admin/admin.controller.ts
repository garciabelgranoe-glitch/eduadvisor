import { Body, Controller, Get, Patch, Post, Query, UseGuards, Param } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { ListClaimRequestsDto } from "../schools/dto/list-claim-requests.dto";
import { ListImportRunsDto } from "../schools/dto/list-import-runs.dto";
import { RunImportDto } from "../schools/dto/run-import.dto";
import { UpdateClaimRequestStatusDto } from "../schools/dto/update-claim-request-status.dto";
import { SchoolsService } from "../schools/schools.service";
import { GetGrowthFunnelDto } from "./dto/get-growth-funnel.dto";
import { ListAdminSchoolsDto } from "./dto/list-admin-schools.dto";
import { ListProductEventsDto } from "./dto/list-product-events.dto";
import { UpdateSchoolStatusDto } from "./dto/update-school-status.dto";
import { UpdateSchoolSubscriptionDto } from "./dto/update-school-subscription.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly schoolsService: SchoolsService
  ) {}

  @Get("health")
  health() {
    return { status: "ok", scope: "admin" };
  }

  @Get("overview")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async overview() {
    return this.adminService.getOverview();
  }

  @Get("schools")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async schools(@Query() query: ListAdminSchoolsDto) {
    return this.adminService.listSchools(query);
  }

  @Get("growth-funnel")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async growthFunnel(@Query() query: GetGrowthFunnelDto) {
    return this.adminService.getGrowthFunnel(query);
  }

  @Post("growth-funnel/recompute")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async recomputeGrowthFunnel(@Body() payload: GetGrowthFunnelDto) {
    return this.adminService.recomputeGrowthFunnel(payload);
  }

  @Get("product-events")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async productEvents(@Query() query: ListProductEventsDto) {
    return this.adminService.listProductEvents(query);
  }

  @Patch("schools/:schoolId/status")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async updateSchoolStatus(@Param("schoolId") schoolId: string, @Body() payload: UpdateSchoolStatusDto) {
    return this.adminService.updateSchoolStatus(schoolId, payload);
  }

  @Patch("schools/:schoolId/subscription")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async updateSchoolSubscription(@Param("schoolId") schoolId: string, @Body() payload: UpdateSchoolSubscriptionDto) {
    return this.adminService.updateSchoolSubscription(schoolId, payload);
  }

  @Get("claim-requests")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async claimRequests(@Query() query: ListClaimRequestsDto) {
    return this.schoolsService.listClaimRequests(query);
  }

  @Patch("claim-requests/:claimRequestId/status")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async updateClaimRequestStatus(
    @Param("claimRequestId") claimRequestId: string,
    @Body() payload: UpdateClaimRequestStatusDto
  ) {
    return this.schoolsService.updateClaimRequestStatus(claimRequestId, payload);
  }

  @Post("import-runs")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async runImport(@Body() payload: RunImportDto) {
    return this.schoolsService.runImport(payload);
  }

  @Get("import-runs")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async importRuns(@Query() query: ListImportRunsDto) {
    return this.schoolsService.listImportRuns(query);
  }

  @Get("import-runs/:runId")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async importRunById(@Param("runId") runId: string) {
    return this.schoolsService.getImportRunById(runId);
  }
}
