import re


def normalize_ioc(ioc_type: str, value: str) -> dict:
    ioc_type = ioc_type.strip().lower()
    value = value.strip()

    if ioc_type == "ip":
        value = value.strip("[] ")

    elif ioc_type == "domain":
        value = value.lower().rstrip(".")

    elif ioc_type == "url":
        value = value.strip()
        value = re.sub(r"^https?://", lambda m: m.group(0).lower(), value)

    elif ioc_type == "hash":
        value = value.lower()

    elif ioc_type == "email":
        value = value.lower()

    return {
        "ioc_type": ioc_type,
        "value": value,
    }
