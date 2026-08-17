from __future__ import annotations

from typing import Any

from app.services.ai.base_provider import BaseAIProvider
from app.services.openai_service import OpenAIService


class OpenAIProvider(BaseAIProvider):
    """Concrete provider that delegates to the existing OpenAIService."""

    async def generate_meal_plan(self, prompt_data: dict[str, Any]) -> dict:
        # Expecting prompt_data to contain prompt, history, message
        prompt = prompt_data.get("prompt", "")
        history = prompt_data.get("history", [])
        message = prompt_data.get("message", "")

        content = await OpenAIService.get_response(prompt=prompt, history=history, message=message)

        return {"content": content}
