import "reflect-metadata";
import { ExecutionContext, ForbiddenException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { User } from "@/modules/identity/core/domain/entities/User";
import { UserRoles } from "@/modules/identity/core/domain/enums/user-roles";
import { UserStatus } from "@/modules/identity/core/domain/enums/user-status";
import { UserCredential } from "@/modules/identity/auth/domain/entities/UserCredential";
import { AdminGuard } from "@/modules/identity/auth/presentation/meta/guards/admin.guard";
import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta/guards/jwt-auth.guard";
import { UpdateLocationDto } from "@/modules/identity/auth/presentation/dtos/user-request.dtos";
import { AdminUsersController } from "@/modules/back-office/users/presentation/users.admin.controller";
import { PrismaUserRepository } from "@/modules/identity/core/infra/repositories/prisma-users-repository";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UserAdminAssembler, userAdminInclude } from "./prisma-user.assembler.admin";

describe("Administrative user locations", () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("includes IP, coordinates and their timestamp in the admin API representation", () => {
    const locationUpdatedAt = new Date("2026-10-03T12:00:00Z");
    const input = {
      id: 1, publicId: "user-1", name: "Usuário", gender: null, isVerified: true,
      role: "USER", status: "ACTIVE", createdAt: locationUpdatedAt, updatedAt: locationUpdatedAt,
      lastLoginAt: locationUpdatedAt, avatarImageSources: null, Profile: null,
      Credentials: [], bio: null, ipAddress: "203.0.113.1", latitude: 0, longitude: -41.78, locationUpdatedAt,
    } as Prisma.UserGetPayload<{ include: typeof userAdminInclude }>;
    const user = UserAdminAssembler.fromPrisma(input)!;
    expect(JSON.parse(JSON.stringify(user))).toMatchObject({
      ipAddress: "203.0.113.1", latitude: 0, longitude: -41.78, locationUpdatedAt: locationUpdatedAt.toISOString(),
    });
    expect(UserAdminAssembler.fromPrisma({ ...input, ipAddress: null, latitude: null, longitude: null, locationUpdatedAt: null })).toMatchObject({
      ipAddress: null, latitude: null, longitude: null, locationUpdatedAt: null,
    });
  });

  it("keeps the user listing protected by authentication and active administrator access", () => {
    expect(Reflect.getMetadata("__guards__", AdminUsersController)).toEqual([JwtAuthGuard, AdminGuard]);
    const guard = new AdminGuard();
    const user = User.Create("Admin", {} as UserCredential);
    const context = { switchToHttp: () => ({ getRequest: () => ({ user }) }) } as ExecutionContext;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    user.role = UserRoles.ADMIN;
    expect(guard.canActivate(context)).toBe(true);
    user.status = UserStatus.SUSPENDED;
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    user.status = UserStatus.ACTIVE;
    user.credentials = [];
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("validates location coordinates, including zero", async () => {
    expect(await validate(plainToInstance(UpdateLocationDto, { latitude: 0, longitude: 0 }))).toHaveLength(0);
    for (const body of [{}, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: -181 }, { latitude: "invalid", longitude: 0 }]) {
      expect((await validate(plainToInstance(UpdateLocationDto, body))).length).toBeGreaterThan(0);
    }
  });

  it("persists the coordinates and timestamp once and propagates database failures", async () => {
    const update = jest.fn().mockResolvedValue({});
    const repository = new PrismaUserRepository({ user: { update } } as unknown as PrismaService);
    await repository.updateLocation(1, 0, -41.78);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { latitude: 0, longitude: -41.78, locationUpdatedAt: expect.any(Date) } });
    update.mockRejectedValue(new Error("Database unavailable"));
    await expect(repository.updateLocation(1, 0, -41.78)).rejects.toThrow("Failed to update user location");
  });
});
