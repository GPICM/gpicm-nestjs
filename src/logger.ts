/* eslint-disable @typescript-eslint/restrict-template-expressions */
// src/logger.ts
import * as winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { WinstonModule } from "nest-winston";

// Replace this with your actual Logtail token

// Create a Logtail client
export const logtail = new Logtail("3cdiG7WPeNgfrn4jPNu51fta", {
  endpoint: "https://s1271546.eu-nbg-2.betterstackdata.com",
});

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp }) =>
            `${timestamp} [${level}]: ${message}`
        )
      ),
    }),
    new LogtailTransport(logtail),
  ],
});
