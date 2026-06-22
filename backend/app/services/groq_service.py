import requests
import json
from typing import Optional, Dict, Any, List
from app.config import settings


class GroqService:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.model = settings.groq_model or "mixtral-8x7b-32768"
        self.base_url = "https://api.groq.com/openai/v1"

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def test_connection(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {"success": False, "message": "Groq API key not configured."}
        try:
            resp = requests.get(
                f"{self.base_url}/models",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=10,
            )
            if resp.status_code == 200:
                models = resp.json().get("data", [])
                available = [m["id"] for m in models if "8x7b" in m["id"] or "70b" in m["id"] or "llama" in m["id"]]
                return {"success": True, "message": f"Connected. Available models: {len(models)}", "models": available}
            return {"success": False, "message": f"Groq API error: {resp.status_code}"}
        except requests.exceptions.RequestException as e:
            return {"success": False, "message": f"Connection failed: {str(e)}"}

    def get_available_models(self) -> List[str]:
        try:
            resp = requests.get(
                f"{self.base_url}/models",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=10,
            )
            if resp.status_code == 200:
                return [m["id"] for m in resp.json().get("data", [])]
            return ["mixtral-8x7b-32768", "llama2-70b-4096"]
        except Exception:
            return ["mixtral-8x7b-32768", "llama2-70b-4096"]

    def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 8192) -> Optional[str]:
        if not self.is_configured():
            return None
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            resp = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=60,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            return None
        except requests.exceptions.RequestException:
            return None


groq_service = GroqService()
