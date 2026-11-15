import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { AdminGuard } from "@/modules/identity/auth/presentation/meta/guards/admin.guard";

import { LoginMetricsService } from "../application/login-metrics.service";
import {
  LOGIN_METRICS_DEFAULT_DAYS,
  LoginMetricsAdminQueryDto,
} from "./dtos/login-metrics.admin.dto";

@Controller("back-office/metrics")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAccessMetricsController {
  constructor(private readonly loginMetrics: LoginMetricsService) {}

  /** Logins com usuário próprio: hoje, mês atual, total e série diária do período pedido. */
  @Get("logins")
  async logins(@Query() query: LoginMetricsAdminQueryDto) {
    return this.loginMetrics.execute(query.days ?? LOGIN_METRICS_DEFAULT_DAYS);
  }
}
