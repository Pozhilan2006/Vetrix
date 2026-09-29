import json
import logging
import re

from .transaction_helper import audit_log_timestamp


_ALLOWED_EVENTS = {
    "transaction_requested",
    "validation_completed",
    "transaction_completed",
    "transaction_failed",
}
_SENSITIVE_KEY_MARKERS = ("apikey", "password", "privatekey", "secret", "token")
_LOGGER = logging.getLogger("vetrix.audit")
if not _LOGGER.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _LOGGER.addHandler(_handler)
    _LOGGER.setLevel(logging.INFO)
    _LOGGER.propagate = False


def _redact_sensitive_values(value):
    if isinstance(value, dict):
        return {
            key: "[REDACTED]" if any(
                marker in re.sub(r"[^a-z0-9]", "", str(key).lower())
                for marker in _SENSITIVE_KEY_MARKERS
            )
            else _redact_sensitive_values(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [_redact_sensitive_values(item) for item in value]
    return value


def log_audit_event(event, details=None):
    """Log one supported application event with a UTC timestamp."""
    if event not in _ALLOWED_EVENTS:
        raise ValueError(f"Unsupported audit event: {event}")
    if details is not None and not isinstance(details, dict):
        raise TypeError("Audit details must be a dictionary")

    record = {
        "timestamp": audit_log_timestamp(),
        "event": event,
        "details": _redact_sensitive_values(details or {}),
    }
    _LOGGER.info("%s", json.dumps(record, sort_keys=True, default=str))