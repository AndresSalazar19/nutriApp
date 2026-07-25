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

        headers = {
            "Authorization": f"Bearer {os.getenv('BLACKBOX_API_KEY')}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": os.getenv("OPENAI_MODEL"),
            "messages": messages,
            "stream": False,
        }

        print(payload)

        try:

            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    cls.BASE_URL,
                    headers=headers,
                    json=payload,
                )

            # <-- AGREGAR ESTO
            print("Status:", response.status_code)
            print("Respuesta de Blackbox:")
            print(response.text)

            response.raise_for_status()

            data = response.json()

            return data["choices"][0]["message"]["content"].strip()

        except Exception as ex:
            raise RuntimeError(f"Error comunicándose con Blackbox AI: {ex}") from ex
