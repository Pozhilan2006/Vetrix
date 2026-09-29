from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import re


_ETHEREUM_ADDRESS_PATTERN = re.compile(r"^0x[a-fA-F0-9]{40}$")
_WEI_PER_ETH = Decimal("1000000000000000000")


def validate_ethereum_address(address):
    """Return whether an address has the standard 0x + 40 hex-character form."""
    return isinstance(address, str) and bool(_ETHEREUM_ADDRESS_PATTERN.fullmatch(address))


def eth_to_wei(value):
    """Convert an ETH value to an integer number of wei without float rounding."""
    try:
        eth_value = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError("ETH value must be a valid number") from None

    if not eth_value.is_finite():
        raise ValueError("ETH value must be finite")

    wei_value = eth_value * _WEI_PER_ETH
    if wei_value != wei_value.to_integral_value():
        raise ValueError("ETH value cannot have more than 18 decimal places")
    return int(wei_value)


def wei_to_eth(value):
    """Convert an integer wei value to a Decimal ETH value."""
    try:
        wei_value = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError("Wei value must be a valid number") from None
    if not wei_value.is_finite() or wei_value != wei_value.to_integral_value():
        raise ValueError("Wei value must be a finite integer")
    return wei_value / _WEI_PER_ETH


def format_transaction_info(transaction):
    """Return a concise summary of common transaction fields."""
    transaction_id = transaction.get("id") or transaction.get("txHash") or "unknown"
    amount = transaction.get("amount", "unknown")
    asset = transaction.get("asset", "ETH")
    status = transaction.get("status", "unknown")
    recipient = transaction.get("toAddress") or transaction.get("to_address") or "unknown"
    return f"Transaction {transaction_id}: {amount} {asset} to {recipient} ({status})"


def audit_log_timestamp():
    """Return the current UTC time as an ISO 8601 timestamp."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")