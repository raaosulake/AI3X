from app.config import cipher


def encrypt_value(value: str) -> str:
    if not value:
        return ""
    return cipher.encrypt(value.encode()).decode()


def decrypt_value(encrypted: str) -> str:
    if not encrypted:
        return ""
    try:
        return cipher.decrypt(encrypted.encode()).decode()
    except Exception:
        return ""
