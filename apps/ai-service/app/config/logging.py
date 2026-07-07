import sys

from loguru import logger

from app.config.settings import settings


def configure_logging() -> None:
    """
    Configures the global loguru logger. Called once at app startup.
    - Development: human-readable, colorized console output.
    - Production: structured JSON (consumable by log aggregators, same
      philosophy as the Node backend's Pino production output).
    """
    logger.remove()
    normalized_level = settings.log_level.strip().upper()

    if settings.environment == "production":
        logger.add(sys.stdout, level=normalized_level, serialize=True)
    else:
        logger.add(
            sys.stdout,
            level=normalized_level,
            colorize=True,
            format=(
                "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
                "<level>{level: <8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                "<level>{message}</level>"
            ),
        )


__all__ = ["logger", "configure_logging"]
