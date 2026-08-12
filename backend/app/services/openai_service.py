import asyncio
import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()


class OpenAIService:
    BASE_URL = "https://api.blackbox.ai/chat/completions"

    @classmethod
    def _build_messages(
        cls,
        *,
        prompt: str,
        history: list[dict[str, Any]],
        message: str,
    ) -> list[dict[str, Any]]:
        messages = [
            {
                "role": "system",
                "content": prompt,
            }
        ]

        if history:
            messages.extend(history)

        # AGREGAR EL MENSAJE ACTUAL DEL USUARIO
        messages.append(
            {
                "role": "user",
                "content": message,
            }
        )

        return messages

    @classmethod
    async def get_response(
        cls,
        *,
        prompt: str,
        history: list[dict[str, Any]],
        message: str,
    ) -> str:
        messages = cls._build_messages(
            prompt=prompt,
            history=history,
            message=message,
        )

        return await cls._call(messages)

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

        messages = [
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": message_text},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{image_mime};base64,{image_base64}"},
                    },
                ],
            },
        ]

        return await cls._call(messages)

    @classmethod
    async def _call(cls, messages: list[dict[str, Any]]) -> str:
        headers = {
            "Authorization": f"Bearer {os.getenv('BLACKBOX_API_KEY')}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": os.getenv("OPENAI_MODEL"),
            "messages": messages,
            "stream": False,
        }

        last_error = None

        for intento in range(3):
            try:
                async with httpx.AsyncClient(timeout=60) as client:
                    response = await client.post(
                        cls.BASE_URL,
                        headers=headers,
                        json=payload,
                    )

                if response.status_code == 429:
                    last_error = f"Blackbox 429: {response.text}"
                    await asyncio.sleep(2**intento)  # 1s, 2s, 4s
                    continue

                if response.status_code >= 400:
                    raise RuntimeError(f"Blackbox {response.status_code}: {response.text}")

                data = response.json()
                return data["choices"][0]["message"]["content"].strip()

            except RuntimeError:
                raise
            except Exception as ex:
                last_error = str(ex)
                await asyncio.sleep(2**intento)

        raise RuntimeError(f"Error comunicándose con Blackbox AI: {last_error}")
