import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { ListSchoolLeadsDto } from "./dto/list-school-leads.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { LeadsService } from "./leads.service";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @RateLimit({ limit: 40, windowMs: 60_000 })
  async create(@Body() payload: CreateLeadDto) {
    return this.leadsService.createLead(payload);
  }

  @Get("school/:schoolId")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async listSchoolLeads(@Param("schoolId") schoolId: string, @Query() query: ListSchoolLeadsDto) {
    return this.leadsService.listSchoolLeads(schoolId, query);
  }

  @Get("school/:schoolId/summary")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async schoolLeadSummary(@Param("schoolId") schoolId: string) {
    return this.leadsService.getSchoolLeadSummary(schoolId);
  }

  @Get(":leadId")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async byId(@Param("leadId") leadId: string) {
    return this.leadsService.getLeadById(leadId);
  }

  @Patch(":leadId/status")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async updateLeadStatus(@Param("leadId") leadId: string, @Body() payload: UpdateLeadStatusDto) {
    return this.leadsService.updateLeadStatus(leadId, payload);
  }
}
