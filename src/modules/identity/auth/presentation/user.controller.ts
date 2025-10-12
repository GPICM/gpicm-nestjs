import {
  Controller,
  Logger,
  Body,
  Inject,
  Put,
  UseGuards,
  BadRequestException,
  Get,
  UnauthorizedException,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { User } from "../../core/domain/entities/User";
import { UpdateLocationDto, UpdateUserDataDto } from "./dtos/user-request.dtos";
import { JwtAuthGuard } from "./meta/guards/jwt-auth.guard";
import { ActiveUserGuard } from "./meta/guards/active-user.guard";
import { UserService } from "../application/user/user.service";

@Controller("identity/users")
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  public constructor(
    @Inject(UserService)
    private readonly userService: UserService
  ) {}

  @Put("/me/location")
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

  @Put("/me")
  @UseGuards(ActiveUserGuard)
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

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    try {
      return user;
    } catch (error: unknown) {
      this.logger.error("Failed to signIn Guest", { error });
      throw new UnauthorizedException();
    }
  }
}
