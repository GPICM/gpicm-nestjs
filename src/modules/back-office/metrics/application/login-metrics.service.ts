import { Inject, Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/modules/shared/services/prisma-services";

/**
 * Uma "visita" é um login com usuário próprio: `SIGNIN` (login) e `SIGNUP` (o cadastro já entra logado),
 * registrados em `user_logs` pelo AuthenticationService. Logins de convidado (`GUEST_SIGNIN`) ficam de fora.
 */
export const LOGIN_ACTIONS = ["SIGNIN", "SIGNUP"] as const;

/**
 * Os dias são contados no horário de Brasília. O Brasil não tem horário de verão desde 2019,
 * então o deslocamento fixo de −03:00 vale para todo o período.
 */
export const METRICS_TIMEZONE = "America/Sao_Paulo";
const UTC_OFFSET_HOURS = -3;
const UTC_OFFSET_SQL = "-03:00";
const DAY_MS = 24 * 60 * 60 * 1000;

export type LoginCount = { logins: number; users: number };
export type DailyLogins = LoginCount & { date: string };

export type LoginMetrics = {
  timezone: string;
  generatedAt: string;
  today: LoginCount & { date: string };
  month: LoginCount & {
    start: string;
    daysElapsed: number;
    dailyAverage: number;
  };
  total: LoginCount & { since: string | null; dailyAverage: number };
  period: LoginCount & {
    days: number;
    from: string;
    to: string;
    dailyAverage: number;
    peak: DailyLogins | null;
    daily: DailyLogins[];
  };
};

/** Data local (YYYY-MM-DD) de um instante. */
const localDate = (instant: Date) =>
  new Date(instant.getTime() + UTC_OFFSET_HOURS * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
/** Instante UTC da meia-noite local de uma data YYYY-MM-DD. */
const localMidnight = (date: string) =>
  new Date(Date.parse(`${date}T00:00:00Z`) - UTC_OFFSET_HOURS * 60 * 60 * 1000);
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
const round1 = (value: number) => Math.round(value * 10) / 10;

@Injectable()
export class LoginMetricsService {
  private readonly logger = new Logger(LoginMetricsService.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  public async execute(days: number, now = new Date()): Promise<LoginMetrics> {
    const today = localDate(now);
    const monthStart = `${today.slice(0, 7)}-01`;
    const periodStart = addDays(today, -(days - 1));

    const [todayCount, monthCount, periodCount, totalCount, daily] =
      await Promise.all([
        this.count(localMidnight(today)),
        this.count(localMidnight(monthStart)),
        this.count(localMidnight(periodStart)),
        this.countAll(),
        this.daily(localMidnight(periodStart)),
      ]);

    // Série completa, com zero nos dias sem login.
    const byDate = new Map(daily.map((entry) => [entry.date, entry]));
    const series: DailyLogins[] = Array.from({ length: days }, (_, index) => {
      const date = addDays(periodStart, index);
      return byDate.get(date) ?? { date, logins: 0, users: 0 };
    });
    const peak = series.reduce<DailyLogins | null>(
      (best, entry) =>
        entry.logins > 0 && (!best || entry.logins > best.logins)
          ? entry
          : best,
      null
    );

    const daysElapsed = Number(today.slice(8, 10));
    const totalDays = totalCount.since
      ? Math.round(
          (Date.parse(`${today}T00:00:00Z`) -
            Date.parse(`${localDate(totalCount.since)}T00:00:00Z`)) /
            DAY_MS
        ) + 1
      : 0;

    this.logger.log("Login metrics computed", {
      days,
      today: todayCount,
      month: monthCount,
    });

    return {
      timezone: METRICS_TIMEZONE,
      generatedAt: now.toISOString(),
      today: { date: today, ...todayCount },
      month: {
        start: monthStart,
        daysElapsed,
        dailyAverage: round1(monthCount.logins / daysElapsed),
        ...monthCount,
      },
      total: {
        logins: totalCount.logins,
        users: totalCount.users,
        since: totalCount.since ? totalCount.since.toISOString() : null,
        dailyAverage: totalDays ? round1(totalCount.logins / totalDays) : 0,
      },
      period: {
        days,
        from: periodStart,
        to: today,
        ...periodCount,
        dailyAverage: round1(periodCount.logins / days),
        peak,
        daily: series,
      },
    };
  }

  private loginFilter() {
    return Prisma.sql`action IN (${Prisma.join([...LOGIN_ACTIONS])}) AND deleted_at IS NULL`;
  }

  private async count(from: Date): Promise<LoginCount> {
    const [row] = await this.prisma.$queryRaw<
      { logins: bigint; users: bigint }[]
    >`
      SELECT COUNT(*) AS logins, COUNT(DISTINCT user_id) AS users
      FROM user_logs
      WHERE ${this.loginFilter()} AND created_at >= ${from}`;
    return { logins: Number(row?.logins ?? 0), users: Number(row?.users ?? 0) };
  }

  private async countAll(): Promise<LoginCount & { since: Date | null }> {
    const [row] = await this.prisma.$queryRaw<
      { logins: bigint; users: bigint; since: Date | null }[]
    >`
      SELECT COUNT(*) AS logins, COUNT(DISTINCT user_id) AS users, MIN(created_at) AS since
      FROM user_logs
      WHERE ${this.loginFilter()}`;
    return {
      logins: Number(row?.logins ?? 0),
      users: Number(row?.users ?? 0),
      since: row?.since ?? null,
    };
  }

  private async daily(from: Date): Promise<DailyLogins[]> {
    const rows = await this.prisma.$queryRaw<
      { day: string; logins: bigint; users: bigint }[]
    >`
      SELECT DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', ${UTC_OFFSET_SQL}), '%Y-%m-%d') AS day,
             COUNT(*) AS logins, COUNT(DISTINCT user_id) AS users
      FROM user_logs
      WHERE ${this.loginFilter()} AND created_at >= ${from}
      GROUP BY day
      ORDER BY day`;
    return rows.map((row) => ({
      date: row.day,
      logins: Number(row.logins),
      users: Number(row.users),
    }));
  }
}
