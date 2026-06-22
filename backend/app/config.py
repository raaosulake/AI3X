import os
import json
import base64
from pathlib import Path
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

IS_VERCEL = os.environ.get("VERCEL") == "1" or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None

if IS_VERCEL:
    DATA_DIR = Path("/tmp")
else:
    DATA_DIR = PROJECT_ROOT

UPLOAD_DIR = DATA_DIR / "uploads"
HISTORY_DIR = DATA_DIR / "history"
SETTINGS_DIR = DATA_DIR / "settings"
BLAST_FILE_PATH = PROJECT_ROOT.parent / "B.L.A.S.T.md"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(HISTORY_DIR, exist_ok=True)
os.makedirs(SETTINGS_DIR, exist_ok=True)

SETTINGS_FILE = SETTINGS_DIR / "settings.json"
FERNET_KEY_FILE = SETTINGS_DIR / ".fernet_key"


def _get_fernet_key() -> bytes:
    if FERNET_KEY_FILE.exists():
        return FERNET_KEY_FILE.read_bytes()
    import platform
    machine_id = platform.node().encode() or b"default-machine-id"
    kdf = PBKDF2(algorithm=hashes.SHA256(), length=32, salt=b"ai-test-doc-gen-salt", iterations=100000)
    key = base64.urlsafe_b64encode(kdf.derive(machine_id))
    FERNET_KEY_FILE.write_bytes(key)
    return key


cipher = Fernet(_get_fernet_key())


class AppSettings:
    def __init__(self):
        self.jira_base_url: str = ""
        self.jira_username: str = ""
        self.jira_api_token: str = ""
        self.jira_default_project: str = ""
        self.groq_api_key: str = ""
        self.groq_model: str = "mixtral-8x7b-32768"
        self.blast_file_path: str = str(BLAST_FILE_PATH)
        self.load()

    def load(self):
        if SETTINGS_FILE.exists():
            try:
                data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
                self.jira_base_url = cipher.decrypt(data.get("jira_base_url", "").encode()).decode() if data.get("jira_base_url") else ""
                self.jira_username = cipher.decrypt(data.get("jira_username", "").encode()).decode() if data.get("jira_username") else ""
                self.jira_api_token = cipher.decrypt(data.get("jira_api_token", "").encode()).decode() if data.get("jira_api_token") else ""
                self.jira_default_project = cipher.decrypt(data.get("jira_default_project", "").encode()).decode() if data.get("jira_default_project") else ""
                self.groq_api_key = cipher.decrypt(data.get("groq_api_key", "").encode()).decode() if data.get("groq_api_key") else ""
                self.groq_model = cipher.decrypt(data.get("groq_model", "").encode()).decode() if data.get("groq_model") else "mixtral-8x7b-32768"
                blast_path_enc = data.get("blast_file_path", "")
                if blast_path_enc:
                    self.blast_file_path = cipher.decrypt(blast_path_enc.encode()).decode()
            except Exception:
                pass

    def save(self):
        data = {
            "jira_base_url": cipher.encrypt(self.jira_base_url.encode()).decode() if self.jira_base_url else "",
            "jira_username": cipher.encrypt(self.jira_username.encode()).decode() if self.jira_username else "",
            "jira_api_token": cipher.encrypt(self.jira_api_token.encode()).decode() if self.jira_api_token else "",
            "jira_default_project": cipher.encrypt(self.jira_default_project.encode()).decode() if self.jira_default_project else "",
            "groq_api_key": cipher.encrypt(self.groq_api_key.encode()).decode() if self.groq_api_key else "",
            "groq_model": cipher.encrypt(self.groq_model.encode()).decode() if self.groq_model else "mixtral-8x7b-32768",
            "blast_file_path": cipher.encrypt(self.blast_file_path.encode()).decode() if self.blast_file_path else "",
        }
        SETTINGS_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def to_dict(self):
        return {
            "jira_base_url": self.jira_base_url,
            "jira_username": self.jira_username,
            "jira_default_project": self.jira_default_project,
            "groq_model": self.groq_model,
            "blast_file_path": self.blast_file_path,
            "jira_api_token": "********" if self.jira_api_token else "",
            "groq_api_key": "********" if self.groq_api_key else "",
        }


settings = AppSettings()
