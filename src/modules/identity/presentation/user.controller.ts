import {
  Controller,
  Logger,
  Body,
  Inject,
  Put,
  UseGuards,
  BadRequestException,
  Get,
  Patch,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { User } from "../domain/entities/User";
import {
  UpdateLocationDto,
  UpdateUserAvatarDto,
  UpdateUserDataDto,
} from "./dtos/user-request.dtos";
import { UserService } from "../application/user.service";
import { JwtAuthGuard } from "./meta/guards/jwt-auth.guard";
import { UserGuard } from "./meta/guards/user.guard";
import { UserBasicData } from "../domain/value-objects/user-basic-data";

@Controller("identity/users")
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  public constructor(
    @Inject(UserService)
    private readonly userService: UserService
  ) {}

  @Put("/location")
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
        userId: user.id,
        latitude: body.latitude,
        longitude: body.longitude,
      });

      return { success: true };
    } catch (error: unknown) {
      this.logger.error("Failed to update location", { error });
      throw new BadRequestException();
    }
  }

  @Put("/profile")
  @UseGuards(UserGuard)
  async updateUserData(
    @CurrentUser() user: User,
    @Body() body: UpdateUserDataDto
  ): Promise<any> {
    try {
      this.logger.log("Updating user data", {
        userId: user.id,
        fields: Object.keys(body),
      });

      const hasAtLeastOneField = Object.values(body).some(
        (value) => value !== undefined
      );

      if (!hasAtLeastOneField) {
        throw new BadRequestException("Nenhum dado fornecido para atualização");
      }

      await this.userService.updateUserData(user, body);

      return { success: true };
    } catch (error: unknown) {
      this.logger.error("Failed to update data", { error });
      throw new BadRequestException();
    }
  }

  @Patch("/profile/avatar")
  @UseGuards(UserGuard)
  async updateUserAvatar(
    @CurrentUser() user: User,
    @Body() body: UpdateUserAvatarDto
  ): Promise<any> {
    try {
      this.logger.log("Updating user avatar", {
        userId: user.id,
        fields: Object.keys(body),
      });

      await this.userService.updateUserAvatar(user, body);

      return { success: true };
    } catch (error: unknown) {
      this.logger.error("Failed to update data", { error });
      throw new BadRequestException();
    }
  }
}