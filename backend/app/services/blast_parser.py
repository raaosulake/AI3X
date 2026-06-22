import os
import re
from pathlib import Path
from typing import Optional, List, Dict, Any
from app.config import settings


class BLASTParser:
    def __init__(self):
        self.content: str = ""
        self.sections: Dict[str, str] = {}
        self.loaded: bool = False

    def load(self, file_path: Optional[str] = None) -> bool:
        path = file_path or settings.blast_file_path
        if not path or not os.path.exists(path):
            self.content = ""
            self.sections = {}
            self.loaded = False
            return False
        try:
            with open(path, "r", encoding="utf-8") as f:
                self.content = f.read()
            self.sections = self._parse_sections(self.content)
            self.loaded = True
            return True
        except Exception:
            self.content = ""
            self.sections = {}
            self.loaded = False
            return False

    def _parse_sections(self, content: str) -> Dict[str, str]:
        sections = {}
        lines = content.split("\n")
        current_section = "General"
        current_content = []

        for line in lines:
            header_match = re.match(r"^#{1,3}\s+(.+)", line)
            if header_match:
                if current_content:
                    sections[current_section] = "\n".join(current_content).strip()
                current_section = header_match.group(1).strip()
                current_content = []
            else:
                current_content.append(line)

        if current_content:
            sections[current_section] = "\n".join(current_content).strip()

        return sections

    def search(self, query: str) -> List[Dict[str, Any]]:
        if not self.content:
            return []
        results = []
        query_lower = query.lower()
        for section_name, section_content in self.sections.items():
            if query_lower in section_content.lower():
                results.append({"section": section_name, "content": section_content[:500]})
        if not results:
            if query_lower in self.content.lower():
                results.append({"section": "General", "content": self.content[:500]})
        return results

    def get_context(self, max_chars: int = 8000) -> str:
        if not self.content:
            return ""
        if len(self.content) <= max_chars:
            return self.content
        return self.content[:max_chars]

    def validate(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        path = file_path or settings.blast_file_path
        if not path or not os.path.exists(path):
            return {"valid": False, "message": "File not found.", "size": 0}
        try:
            size = os.path.getsize(path)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            sections = self._parse_sections(content)
            return {
                "valid": True,
                "message": f"File loaded successfully. {len(sections)} sections found.",
                "size": size,
                "sections": list(sections.keys()),
                "char_count": len(content),
            }
        except Exception as e:
            return {"valid": False, "message": f"Error reading file: {str(e)}", "size": 0}


blast_parser = BLASTParser()
