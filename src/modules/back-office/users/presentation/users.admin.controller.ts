import {
  Get,
  Logger,
  UseGuards,
  Controller,
  Query,
  Inject,
  Post,
  Param,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/presentation/meta";

import { AdminGuard } from "@/modules/identity/presentation/meta/guards/admin.guard";
import { UsersAdminRepository } from "../domain/interfaces/users-repository";
import { ListUsersAdminQueryDto } from "./dtos/list-users.admin.dto";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { CreateProfileUseCase } from "@/modules/social/core/application/create-profile.usecase";
import { UserService } from "@/modules/identity/application/user.service";
import { UserStatus } from "@/modules/identity/domain/enums/user-status";

@Controller("back-office/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    @Inject(UsersAdminRepository)
    private readonly usersRepository: UsersAdminRepository,
    private readonly createProfile: CreateProfileUseCase,
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
      role: query.role,
      status: query.status,
    });

    return new PaginatedResponse(records, total, limit, page, {});
  }

  @Post("/:userId/profile")
  async createUserProfile(@Param("userId") userId: number) {
    this.logger.log("Creating new pofile", { userId });

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException();

    if (user.status !== UserStatus.PENDING_PROFILE) {
      throw new ForbiddenException("Perfil de usuario nao pode ser gerado");
    }

    await this.createProfile.execute(user);
    user.setStatus(UserStatus.ACTIVE);

    await this.userService.updateStatus(user);

    return { message: "success." };
  }
}
