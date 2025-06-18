import {
  Controller,
  Logger,
  Body,
  Inject,
  Put,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { User } from "../domain/entities/User";
import { UpdateLocationDto } from "./dtos/user-request.dtos";
import { UserService } from "../application/user.service";
import { JwtAuthGuard } from "./meta/guards/jwt-auth.guard";

@Controller("user")
export class UserController {
  private readonly logger = new Logger(UserController.name);

  public constructor(
    @Inject(UserService)
    private readonly userService: UserService
  ) {}

  @Put("/location")
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @CurrentUser() user: User,
    @Body() body: UpdateLocationDto
  ): Promise<any> {
    try {
      this.logger.log("Updating user location", {
        userId: user.id,
        latitude: body.latitude,
        longitude: body.longitude,
      });

      await this.userService.updateUserLocation({
        userId: user.id!,
        latitude: body.latitude,
        longitude: body.longitude,
      });

      return { success: true };
    } catch (error: unknown) {
      this.logger.error("Failed to update location", { error });
      throw new BadRequestException();
    }
  }
}
