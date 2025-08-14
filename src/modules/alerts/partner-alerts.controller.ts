import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { PartnerApiKeyGuard } from "../identity/presentation/meta/guards/partner-api-key.guard";

@Controller("alerts/webhook")
@UseGuards(PartnerApiKeyGuard)
export class PartnerAlertsController {
  constructor() {}

  @Post("/")
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  public webhook(): Promise<any> {
    return Promise.resolve({ status: "Recebido" });
  }

  @Post("/publish")
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  public async publishAlert(
    @Body() body: { type: string; message: string }
  ): Promise<{ status: string }> {
    return Promise.resolve({ status: "alerta publicado" });
  }

  @Post("/clear")
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  public async clearAlerts(): Promise<{ status: string }> {
    return Promise.resolve({ status: "alertas limpos" });
  }
}
