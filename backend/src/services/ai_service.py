from typing import Optional
from ..config import settings


class AIService:
    def __init__(self):
        self.provider = settings.default_ai_provider

    async def query(
        self,
        prompt: str,
        context: str,
        model: Optional[str] = None
    ) -> str:
        """Query AI with paper context."""
        if self.provider == "openai":
            return await self._query_openai(prompt, context, model)
        elif self.provider == "anthropic":
            return await self._query_anthropic(prompt, context, model)
        elif self.provider == "ollama":
            return await self._query_ollama(prompt, context, model)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")

    async def _query_openai(self, prompt: str, context: str, model: str = None) -> str:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)

        full_prompt = f"""You are a helpful academic assistant.

Paper content:
{context}

User question: {prompt}

Please provide a detailed and accurate response based on the paper content above."""

        response = await client.chat.completions.create(
            model=model or "gpt-4",
            messages=[{"role": "user", "content": full_prompt}]
        )
        return response.choices[0].message.content

    async def _query_anthropic(self, prompt: str, context: str, model: str = None) -> str:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=settings.anthropic_api_key)

        full_prompt = f"""You are a helpful academic assistant.

Paper content:
{context}

User question: {prompt}

Please provide a detailed and accurate response based on the paper content above."""

        response = await client.messages.create(
            model=model or "claude-3-sonnet-20240229",
            max_tokens=4096,
            messages=[{"role": "user", "content": full_prompt}]
        )
        return response.content[0].text

    async def _query_ollama(self, prompt: str, context: str, model: str = None) -> str:
        import httpx

        full_prompt = f"""You are a helpful academic assistant.

Paper content:
{context}

User question: {prompt}

Please provide a detailed and accurate response based on the paper content above."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": model or "llama2",
                    "prompt": full_prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            return response.json().get("response", "")

    async def translate(self, text: str, target_lang: str = "Chinese") -> str:
        """Translate text to target language."""
        prompt = f"""Translate the following academic text to {target_lang}.
Maintain the academic tone and technical terminology. If there are technical terms, provide both the original term and translation:

{text}"""

        return await self.query(prompt, "")  # No context needed for translation


ai_service = AIService()
