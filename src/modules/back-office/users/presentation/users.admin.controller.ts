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
  Put,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/presentation/meta";

import { AdminGuard } from "@/modules/identity/presentation/meta/guards/admin.guard";
import { UsersAdminRepository } from "../domain/interfaces/users-repository";
import { ListUsersAdminQueryDto } from "./dtos/list-users.admin.dto";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";
import { CreateProfileUseCase } from "@/modules/social/core/application/create-profile.usecase";
import { UserService } from "@/modules/identity/application/user.service";
import { UserStatus } from "@/modules/identity/domain/enums/user-status";
import { FindProfileByUserUseCase } from "@/modules/social/core/application/find-profile-by-user.usecase";

@Controller("back-office/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    @Inject(UsersAdminRepository)
    private readonly usersRepository: UsersAdminRepository,
    private readonly createProfile: CreateProfileUseCase,
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

    // todo: o correto deve ser: se ele em credentials e nao tiver perfil enta ele eh um guest, e se ele tiver credencials e nao tiver pefil, entao ele en PENDING_PROFILE
    const profile = await this.findProfile.execute(user);
    if (profile) {
      user.setStatus(UserStatus.ACTIVE);
    } else {
      user.setStatus(UserStatus.GUEST);
    }
    await this.userService.updateStatus(user);

    return { message: "success." };
  }
}
