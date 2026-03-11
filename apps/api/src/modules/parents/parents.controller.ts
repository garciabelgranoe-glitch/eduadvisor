import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { CreateSavedComparisonDto } from "./dto/create-saved-comparison.dto";
import { CreateSavedSchoolDto } from "./dto/create-saved-school.dto";
import { ParentsService } from "./parents.service";

@Controller("parents")
@UseGuards(AdminApiKeyGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get(":userId/dashboard")
  @AdminScopes("read")
  async dashboard(@Param("userId") userId: string) {
    return this.parentsService.getDashboard(userId);
  }

  @Get(":userId/saved-schools")
  @AdminScopes("read")
  async listSavedSchools(@Param("userId") userId: string) {
    return this.parentsService.listSavedSchools(userId);
  }

  @Post(":userId/saved-schools")
  @AdminScopes("write")
  async saveSchool(@Param("userId") userId: string, @Body() payload: CreateSavedSchoolDto) {
    return this.parentsService.saveSchool(userId, payload);
  }

  @Delete(":userId/saved-schools/:schoolId")
  @AdminScopes("write")
  async removeSavedSchool(@Param("userId") userId: string, @Param("schoolId") schoolId: string) {
    return this.parentsService.removeSavedSchool(userId, schoolId);
  }

  @Get(":userId/comparisons")
  @AdminScopes("read")
  async listComparisons(@Param("userId") userId: string) {
    return this.parentsService.listComparisons(userId);
  }

  @Post(":userId/comparisons")
  @AdminScopes("write")
  async saveComparison(@Param("userId") userId: string, @Body() payload: CreateSavedComparisonDto) {
    return this.parentsService.saveComparison(userId, payload);
  }

  @Delete(":userId/comparisons/:comparisonId")
  @AdminScopes("write")
  async removeComparison(@Param("userId") userId: string, @Param("comparisonId") comparisonId: string) {
    return this.parentsService.removeComparison(userId, comparisonId);
  }

  @Get(":userId/alerts")
  @AdminScopes("read")
  async listAlerts(@Param("userId") userId: string) {
    return this.parentsService.listAlerts(userId);
  }

  @Post(":userId/alerts/:alertId/read")
  @AdminScopes("write")
  async markAlertAsRead(@Param("userId") userId: string, @Param("alertId") alertId: string) {
    return this.parentsService.markAlertAsRead(userId, alertId);
  }
}
