/**
 * Raised when configuration cannot be trusted. The CLI catches this and
 * prints the message without a stack trace: a bad config is a user error,
 * not a crash.
 */
export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}
