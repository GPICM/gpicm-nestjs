import {
  Controller,
  Logger,
  Body,
  Inject,
  Put,
  UseGuards,
  BadRequestException,
  Get,
} from "@nestjs/common";

import { CurrentUser } from "./meta/decorators/user.decorator";
import { User } from "../domain/entities/User";
import { UpdateLocationDto, UpdateUserDataDto, UserBasicDataDto } from "./dtos/user-request.dtos";
import { UserService } from "../application/user.service";
import { JwtAuthGuard } from "./meta/guards/jwt-auth.guard";
import { UserGuard } from "./meta/guards/user.guard";

@Controller("users")
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

  @Put("/updateUserData")
  @UseGuards(JwtAuthGuard)
  // @UseGuards(UserGuard)
  async updateUserData(
    @CurrentUser() user: User,
    @Body() body: UpdateUserDataDto
  ): Promise<any> {
    try {
      this.logger.log("Updating user data", {
        userId: user.id,
        fields: Object.keys(body)
      });
      
      const hasAtLeastOneField = Object.values(body).some(
        (value) => value !== undefined
      );

      if (!hasAtLeastOneField) {
        throw new BadRequestException("Nenhum dado fornecido para atualização");
      }

      await this.userService.updateUserData(
        user,
        body
      );

      return { success: true };
    } catch (error: unknown) {
      this.logger.error("Failed to update data", { error });
      throw new BadRequestException();
    }
  }

  @Get("/me/basic-data") 
  @UseGuards(JwtAuthGuard)
  // @UseGuards(UserGuard)
  async getMyBasicData(
    @CurrentUser() user: User 
  ): Promise<any> { 
    try{
      this.logger.log(`Fetching basic data for current user: ${user.publicId}`);

      const UserBasicDataDto = await this.userService.getUserBasicData(
        user,
      );

      return UserBasicDataDto;
    } catch (error: unknown) {
      this.logger.error("Failed to get user basic data", { error });
      throw new BadRequestException();
    }
  }
  
}



