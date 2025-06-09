import { Inject, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";

export class PrismaTestRepository {
  private readonly logger: Logger = new Logger(PrismaTestRepository.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async add(name: string): Promise<void> {
    try {
      this.logger.log(`Adding new Test`);

      await this.prisma.test.create({
        data: { name, description: name },
      });

      this.logger.log(`Test added successfully`);
    } catch (error: unknown) {
      this.logger.error("Failed to add Test", { error });
      throw new Error("Failed to add incident");
    }
  }

  async find(id: number): Promise<any> {
    try {
      this.logger.log(`Adding new Test`);

      const result = await this.prisma.test.findFirst({
        where: { id },
      });

      this.logger.log(`Test added successfully`);
      return result;
    } catch (error: unknown) {
      this.logger.error("Failed to add Test", { error });
      throw new Error("Failed to add incident");
    }
  }
}
