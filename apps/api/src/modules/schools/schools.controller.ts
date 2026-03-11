import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { CreateClaimRequestDto } from "./dto/create-claim-request.dto";
import { ListSeoCitiesDto } from "./dto/list-seo-cities.dto";
import { ListSeoSitemapDto } from "./dto/list-seo-sitemap.dto";
import { ListSchoolsDto } from "./dto/list-schools.dto";
import { UpdateSchoolProfileDto } from "./dto/update-school-profile.dto";
import { SchoolsService } from "./schools.service";

@Controller("schools")
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  async list(@Query() query: ListSchoolsDto) {
    return this.schoolsService.listSchools(query);
  }

  @Post("claim-requests")
  @RateLimit({ limit: 20, windowMs: 60_000 })
  async createClaimRequest(@Body() payload: CreateClaimRequestDto) {
    return this.schoolsService.createClaimRequest(payload);
  }

  @Get("seo/cities")
  async seoCities(@Query() query: ListSeoCitiesDto) {
    return this.schoolsService.listSeoCities(query);
  }

  @Get("seo/cities/:citySlug")
  async seoCityBySlug(@Param("citySlug") citySlug: string) {
    return this.schoolsService.getSeoCityBySlug(citySlug);
  }

  @Get("seo/sitemap")
  async seoSitemap(@Query() query: ListSeoSitemapDto) {
    return this.schoolsService.getSeoSitemap(query);
  }

  @Get("id/:schoolId/dashboard")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async dashboard(@Param("schoolId") schoolId: string) {
    return this.schoolsService.getSchoolDashboard(schoolId);
  }

  @Patch("id/:schoolId/profile")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async updateProfile(@Param("schoolId") schoolId: string, @Body() payload: UpdateSchoolProfileDto) {
    return this.schoolsService.updateSchoolProfile(schoolId, payload);
  }

  @Get("id/:schoolId/billing")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async billing(@Param("schoolId") schoolId: string) {
    return this.schoolsService.getSchoolBilling(schoolId);
  }

  @Get("id/:schoolId/leads/export")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async leadsExport(@Param("schoolId") schoolId: string) {
    return this.schoolsService.exportSchoolLeadsCsv(schoolId);
  }

  @Get(":slug")
  async bySlug(@Param("slug") slug: string) {
    return this.schoolsService.getSchoolBySlug(slug);
  }
}
