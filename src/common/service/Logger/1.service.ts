import winston from "winston";
import { injectable } from "inversify";
import { ILogger } from "./0.model";
import { formatUTCTime } from "../../utility/date-helper";
import { serverConfig } from "../../server/0.server-config";

@injectable()
export class LoggerService implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = this.initialize();
  }

  private initialize() {
    return winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: formatUTCTime(serverConfig.log.timeFormat ?? "yyyy-MM-dd"),
        }),
        winston.format.printf(
          (info) => `${info.timestamp}: ${info.level} => ${info.message}`
        ),
        winston.format.colorize({ all: true })
      ),
      transports: [
        new winston.transports.Console({
          level: serverConfig.log.level,
        }),
      ],
    });
  }

  info(message: any) {
    this.logger.info(message);
  }

  warn(message: any) {
    this.logger.warn("WARNING => " + message);
  }

  error(message: any) {
    this.logger.error("ERROR => " + message);
  }
}
