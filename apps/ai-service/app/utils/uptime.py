def format_uptime(uptime_seconds: float) -> str:
    """Formats elapsed seconds into a human-readable string, e.g. "2d 3h 14m 7s"."""
    total_seconds = int(uptime_seconds)
    days, remainder = divmod(total_seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)

    parts: list[str] = []
    if days:
        parts.append(f"{days}d")
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")

    return " ".join(parts)
