import {
  Get,
  Logger,
  UseGuards,
  Controller,
  Query,
  Inject,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/presentation/meta";

import { AdminGuard } from "@/modules/identity/presentation/meta/guards/admin.guard";
import { UsersAdminRepository } from "../domain/interfaces/users-repository";
import { ListUsersAdminQueryDto } from "./dtos/list-users.admin.dto";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";

@Controller("back-office/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    @Inject(UsersAdminRepository)
    private readonly usersRepository: UsersAdminRepository
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
}
