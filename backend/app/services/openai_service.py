import asyncio
import os
from typing import Any

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class OpenAIService:
    @classmethod
    def _build_input(
        cls,
        *,
        history: list[dict[str, Any]],
        message: str,
    ) -> list[dict[str, Any]]:
        input_items: list[dict[str, Any]] = list(history) if history else []

        # AGREGAR EL MENSAJE ACTUAL DEL USUARIO
        input_items.append(
            {
                "role": "user",
                "content": message,
            }
        )

        return input_items

    @classmethod
    async def get_response(
        cls,
        *,
        prompt: str,
        history: list[dict[str, Any]],
        message: str,
    ) -> str:
        input_items = cls._build_input(history=history, message=message)

        return await cls._call(instructions=prompt, input_items=input_items)

    @classmethod
    async def get_vision_response(
        cls,
        *,
        prompt: str,
        message_text: str,
        image_base64: str,
        image_mime: str,
    ) -> str:
        """Same as get_response, but attaches an image to the user message."""

        input_items = [
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": message_text},
                    {
                        "type": "input_image",
                        "image_url": f"data:{image_mime};base64,{image_base64}",
                    },
                ],
            }
        ]

        return await cls._call(instructions=prompt, input_items=input_items)

    @classmethod
    async def _call(cls, *, instructions: str, input_items: list[dict[str, Any]]) -> str:
        last_error = None

        for intento in range(3):
            try:
                response = await _client.responses.create(
                    model=os.getenv("OPENAI_MODEL"),
                    instructions=instructions,
                    input=input_items,
                    text={"format": {"type": "text"}, "verbosity": "medium"},
                    reasoning={"effort": "medium", "summary": "auto"},
                    store=True,
                )

                return response.output_text.strip()

            except Exception as ex:
                status_code = getattr(ex, "status_code", None)
                last_error = str(ex)

                if status_code == 429:
                    await asyncio.sleep(2**intento)  # 1s, 2s, 4s
                    continue

                if status_code is not None:
                    raise RuntimeError(f"OpenAI {status_code}: {last_error}") from ex

                await asyncio.sleep(2**intento)

        raise RuntimeError(f"Error comunicándose con OpenAI: {last_error}")
