import {
  Get,
  Logger,
  UseGuards,
  Controller,
  Query,
  Inject,
  Param,
  NotFoundException,
  ForbiddenException,
  Put,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";

import { AdminGuard } from "@/modules/identity/auth/presentation/meta/guards/admin.guard";
import { UsersAdminRepository } from "../domain/interfaces/users-repository";
import { ListUsersAdminQueryDto } from "./dtos/list-users.admin.dto";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";
import { FindProfileByUserUseCase } from "@/modules/social/core/application/find-profile-by-user.usecase";
import { UserService } from "@/modules/identity/auth/application/user/user.service";

@Controller("back-office/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    @Inject(UsersAdminRepository)
    private readonly usersRepository: UsersAdminRepository,
    private readonly findProfile: FindProfileByUserUseCase,
    private readonly userService: UserService
  ) {}

  @Get()
  async listUsers(@Query() query: ListUsersAdminQueryDto) {
    this.logger.log("Fetching all posts", { query });

    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } = await this.usersRepository.listAll({
      limit,
      offset,
      search: query.search,
      roleIn: query.roles,
      statusIn: query.statuses,
    });

    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Get("summaries/count")
  async getUsersCountSummary() {
    this.logger.log("Fetching users count summary");
    return this.usersRepository.getCountSummary();
  }

  @Put("/:userId/ban")
  async banUser(@Param("userId") userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException();

    user.setStatus(UserStatus.BANNED);
    await this.userService.updateStatus(user);

    return { message: "success." };
  }

  @Put("/:userId/suspend")
  async suspend(@Param("userId") userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException();

    user.setStatus(UserStatus.SUSPENDED);
    await this.userService.updateStatus(user);

    return { message: "success." };
  }

  @Put("/:userId/activate")
  async activate(@Param("userId") userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException();

    if (user.status === UserStatus.ACTIVE) {
      throw new ForbiddenException("User is already active");
    }

    if (user.status === UserStatus.GUEST) {
      throw new ForbiddenException("Cannot active a guest");
    }

    const profile = await this.findProfile.execute(user);
    if (profile) {
      throw new ForbiddenException(
        "User cannot be activated without a profile"
      );
    }

    user.setStatus(UserStatus.ACTIVE);
    await this.userService.updateStatus(user);

    return { message: "success." };
  }
}
