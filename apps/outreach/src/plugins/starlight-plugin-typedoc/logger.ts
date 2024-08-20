import type { AstroIntegrationLogger } from 'astro';
import { Logger, LogLevel } from 'typedoc';

export class StarlightTypeDocLogger extends Logger {
  #logger: AstroIntegrationLogger;

  constructor(logger: AstroIntegrationLogger) {
    super();

    this.#logger = logger;
  }

  override log(message: string, level: LogLevel): void {
    super.log(message, level);

    if (level < this.level) {
      return;
    }

    switch (level) {
      case LogLevel.Error: {
        this.#logger.error(message);
        break;
      }
      case LogLevel.Warn: {
        this.#logger.warn(message);
        break;
      }
      case LogLevel.Verbose: {
        this.#logger.debug(message);
        break;
      }
      default: {
        this.#logger.info(message);
        break;
      }
    }
  }
}
