"""
genai_service.py - LangChain 0.2.x + OpenAI GPT-3.5
"""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import get_settings

settings = get_settings()

class GenAIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.8,
            api_key=settings.OPENAI_API_KEY,
            max_tokens=180,
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are an expert home & furniture copywriter. "
             "Write vivid, appealing 2-3 sentence product descriptions. "
             "Highlight design, material, use-case and lifestyle appeal. "
             "No bullet points. No made-up specs."),
            ("human",
             "Product: {title}\nBrand: {brand}\nCategory: {category}\n"
             "Material: {material}\nColor: {color}\n"
             "Original Description: {description}\n\n"
             "Write a compelling creative description."),
        ])
        self.chain = self.prompt | self.llm | StrOutputParser()

    def generate_description(self, meta: dict) -> str:
        try:
            return self.chain.invoke({
                "title":       meta.get("title", "Product"),
                "brand":       meta.get("brand", ""),
                "category":    meta.get("leaf_category", ""),
                "material":    meta.get("material", ""),
                "color":       meta.get("color", ""),
                "description": str(meta.get("description", ""))[:300],
            }).strip()
        except Exception as e:
            print(f"[GenAI] fallback: {e}")
            return self._fallback(meta)

    def _fallback(self, meta: dict) -> str:
        t = meta.get("title", "This product")
        m = meta.get("material", "premium materials")
        c = meta.get("color", "a timeless finish")
        return (f"{t} is crafted from {m} in {c}, designed to bring style "
                f"and practicality to any room.")

    def generate_chat_reply(self, messages: list, products: list) -> str:
        chat_llm = ChatOpenAI(
            model="gpt-4o-mini", temperature=0.7,
            api_key=settings.OPENAI_API_KEY, max_tokens=200,
        )
        product_names = "\n".join(
            f"- {p.get('title', '')[:80]} ({p.get('brand', '')})" for p in products[:6]
        )
        history = "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in messages)
        system_msg = (
            "You are a friendly furniture shopping assistant. "
            "Based on the conversation and recommended products, write a warm "
            "2-3 sentence intro. Don't list product names — summarise the theme."
        )
        try:
            resp = chat_llm.invoke([
                {"role": "system", "content": system_msg},
                {"role": "user", "content": f"Conversation:\n{history}\n\nRecommended:\n{product_names}"},
            ])
            return resp.content.strip()
        except Exception:
            return "Here are some great options I found that match what you're looking for!"
