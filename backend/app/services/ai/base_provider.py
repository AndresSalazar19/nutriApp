from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseAIProvider(ABC):
    """Abstract base class for AI providers.

    Implementations must provide `generate_meal_plan` which accepts a
    prompt-like payload and returns a dict containing at least a `content`
    string with the assistant response.
    """

    @abstractmethod
    async def generate_meal_plan(self, prompt_data: dict[str, Any]) -> dict:
        """Generate a meal plan or assistant response.

        prompt_data: dictionary with keys such as `prompt`, `history`, `message`.
        Returns: a dict with provider-specific response data. Must include `content`.
        """
        raise NotImplementedError()
