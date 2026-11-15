import { LoginMetricsService } from "./login-metrics.service";

type RawQuery = { strings: TemplateStringsArray; values: unknown[] };

/** Prisma falso: responde cada consulta pela forma do SQL e guarda os parâmetros recebidos. */
function makePrisma(rows: {
  counts: Record<string, { logins: number; users: number }>;
  total: { logins: number; users: number; since: Date | null };
  daily: { day: string; logins: number; users: number }[];
}) {
  const calls: RawQuery[] = [];
  const prisma = {
    $queryRaw: jest.fn(
      (strings: TemplateStringsArray, ...values: unknown[]) => {
        calls.push({ strings, values });
        const sql = strings.join("?");
        if (sql.includes("GROUP BY day")) {
          return Promise.resolve(
            rows.daily.map((row) => ({
              ...row,
              logins: BigInt(row.logins),
              users: BigInt(row.users),
            }))
          );
        }
        if (sql.includes("MIN(created_at)")) {
          return Promise.resolve([
            {
              logins: BigInt(rows.total.logins),
              users: BigInt(rows.total.users),
              since: rows.total.since,
            },
          ]);
        }
        const from = (
          values.find((value) => value instanceof Date) as Date
        ).toISOString();
        const count = rows.counts[from] ?? { logins: 0, users: 0 };
        return Promise.resolve([
          { logins: BigInt(count.logins), users: BigInt(count.users) },
        ]);
      }
    ),
  };
  return { prisma, calls };
}

describe("LoginMetricsService", () => {
  // 15/11/2026 às 01:30 em Brasília (04:30 UTC).
  const now = new Date("2026-11-15T04:30:00Z");

  it("conta hoje, mês e período a partir da meia-noite de Brasília", async () => {
    const { prisma } = makePrisma({
      counts: {
        "2026-11-15T03:00:00.000Z": { logins: 4, users: 3 }, // hoje
        "2026-11-01T03:00:00.000Z": { logins: 30, users: 12 }, // mês
        "2026-11-09T03:00:00.000Z": { logins: 14, users: 6 }, // período de 7 dias
      },
      total: {
        logins: 300,
        users: 40,
        since: new Date("2026-10-07T12:00:00Z"),
      },
      daily: [
        { day: "2026-11-10", logins: 6, users: 4 },
        { day: "2026-11-15", logins: 4, users: 3 },
      ],
    });
    const service = new LoginMetricsService(prisma as never);

    const metrics = await service.execute(7, now);

    expect(metrics.today).toEqual({ date: "2026-11-15", logins: 4, users: 3 });
    expect(metrics.month).toMatchObject({
      start: "2026-11-01",
      daysElapsed: 15,
      logins: 30,
      dailyAverage: 2,
    });
    expect(metrics.period).toMatchObject({
      from: "2026-11-09",
      to: "2026-11-15",
      logins: 14,
      users: 6,
      dailyAverage: 2,
    });
    // 07/10 a 15/11, inclusive: 40 dias.
    expect(metrics.total).toMatchObject({
      logins: 300,
      users: 40,
      dailyAverage: 7.5,
    });
  });

  it("preenche com zero os dias sem login e aponta o pico", async () => {
    const { prisma } = makePrisma({
      counts: {},
      total: { logins: 10, users: 5, since: new Date("2026-11-10T12:00:00Z") },
      daily: [
        { day: "2026-11-10", logins: 6, users: 4 },
        { day: "2026-11-15", logins: 4, users: 3 },
      ],
    });
    const service = new LoginMetricsService(prisma as never);

    const { period } = await service.execute(7, now);

    expect(period.daily.map((entry) => entry.date)).toEqual([
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ]);
    expect(period.daily.map((entry) => entry.logins)).toEqual([
      0, 6, 0, 0, 0, 0, 4,
    ]);
    expect(period.peak).toEqual({ date: "2026-11-10", logins: 6, users: 4 });
  });

  it("sem nenhum login, não divide por zero nem inventa pico", async () => {
    const { prisma } = makePrisma({
      counts: {},
      total: { logins: 0, users: 0, since: null },
      daily: [],
    });
    const service = new LoginMetricsService(prisma as never);

    const metrics = await service.execute(7, now);

    expect(metrics.total).toEqual({
      logins: 0,
      users: 0,
      since: null,
      dailyAverage: 0,
    });
    expect(metrics.period.peak).toBeNull();
    expect(metrics.period.daily).toHaveLength(7);
  });

  it("filtra só logins de usuário próprio (SIGNIN e SIGNUP)", async () => {
    const { prisma, calls } = makePrisma({
      counts: {},
      total: { logins: 0, users: 0, since: null },
      daily: [],
    });
    await new LoginMetricsService(prisma as never).execute(7, now);

    const params = calls
      .flatMap((call) => call.values)
      .flatMap((value) =>
        value && typeof value === "object" && "values" in value
          ? (value as { values: unknown[] }).values
          : [value]
      );
    expect(params).toEqual(expect.arrayContaining(["SIGNIN", "SIGNUP"]));
    expect(params).not.toContain("GUEST_SIGNIN");
  });
});
