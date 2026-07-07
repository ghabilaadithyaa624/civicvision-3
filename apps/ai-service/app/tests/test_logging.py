from app.config import logging as logging_module


def test_configure_logging_accepts_lowercase_log_level() -> None:
    original_level = logging_module.settings.log_level
    try:
        logging_module.settings.log_level = "info"
        logging_module.configure_logging()
    finally:
        logging_module.settings.log_level = original_level
