from openai import OpenAI
from backend.config import get_settings

settings = get_settings()


class GenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_description(self, meta: dict) -> str:
        try:
            prompt = f"""
Write a short 2-3 sentence furniture product description.

Product: {meta.get("title", "")}
Brand: {meta.get("brand", "")}
Category: {meta.get("leaf_category", "")}
Material: {meta.get("material", "")}
Color: {meta.get("color", "")}
Description: {meta.get("description", "")[:200]}
"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=120,
                temperature=0.7,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"[GenAI] fallback: {e}")
            return self._fallback(meta)

    def _fallback(self, meta: dict) -> str:
        t = meta.get("title", "This product")
        m = meta.get("material", "premium materials")
        c = meta.get("color", "a timeless finish")
        return f"{t} is crafted from {m} in {c}, designed to enhance your space."

    def generate_chat_reply(self, messages: list, products: list) -> str:
        try:
            history = "\n".join(f"{m['role']}: {m['content']}" for m in messages)

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"Conversation:\n{history}\n\nGive a short helpful reply."
                }],
                max_tokens=120,
            )

            return response.choices[0].message.content.strip()

        except Exception:
            return "Here are some great options I found for you!"