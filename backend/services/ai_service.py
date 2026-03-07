import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
# Needs GROQ_API_KEY in environment
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def transcribe_audio(file_path: str) -> str:
    """Uses Groq's whisper model to transcribe multilingual audio (Hinglish/Hindi/English)"""
    with open(file_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            file=f,
            model="whisper-large-v3",
            prompt="The user is ordering food at a restaurant. Could be in Hindi, English, or Hinglish.",
        )
    return transcription.text

def parse_order_intent(transcript: str, menu_context: str, current_cart: str = "[]") -> str:
    """Uses Llama 3 on Groq to parse natural language intent into structured schema."""
    system_prompt = f"""
    You are an AI order taker for an Indian restaurant. 
    Analyze the user's input and extract the intent and order items.
    
    CRITICAL CUMULATIVE CART RULE:
    The `items` array you return MUST represent the ENTIRE RUNNING TOTAL CART for this customer.
    The customer's CURRENT CART is: {current_cart}
    
    1. If the user orders something new, ADD it to the CURRENT CART and return BOTH old and new items.
    2. If the user asks a question, says "Thank you", or says anything that doesn't add/remove food, you MUST still return exactly the CURRENT CART in the `items` array. NEVER return an empty array if they already ordered something.
    3. If they ask to remove an item, remove it from the cumulative list.
    
    Map the items strictly to the following menu. Do not hallucinate IDs or names.
    If the user asks for the price of an item or general information, set intent to "INFO" and provide the answer in the order_summary_text.
    
    Menu:
    {menu_context}
    
    Structure the response as JSON exactly matching this schema:
    {{
      "intent": "ORDER" or "INFO" or "COMPLAINT",
      "items": [
         {{ "menu_item_id": 1, "quantity": 2, "modifiers": "extra spicy" }}
      ],
      "order_summary_text": "Got it! Two Butter Chicken, extra spicy."
    }}
    
    Return ONLY valid, raw JSON. Do not include markdown blocks, explanation or additional text.
    """
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript}
        ],
        temperature=0.0
    )
    
    return response.choices[0].message.content

def process_conversation_turn(transcript: str, chat_history: list, menu_context: str, current_cart: str = "[]") -> str:
    """Uses Llama 3 to act as a conversational agent keeping track of previous turns."""
    system_prompt = f"""
    You are an AI order taker for an Indian restaurant. You are on a live phone call with a customer.
    Be polite, extremely concise (like a real human on the phone), and helpful.
    
    CRITICAL CUMULATIVE CART RULE:
    The `items` array you return MUST represent the ENTIRE RUNNING TOTAL CART for this customer over the whole conversation. 
    The customer's CURRENT CART is: {current_cart}
    
    1. If the user previously ordered "Butter Chicken", and now says "Add a garlic naan", you MUST return BOTH in the `items` array.
    2. If the user says "Thank you", asks a question, or says anything that doesn't add/remove food, you MUST still return ALL previously accumulated items. NEVER return an empty array if they already ordered something.
    3. If they ask to remove an item, remove it from the cumulative list.
    
    Keep the items strictly mapped to the following menu. Do not hallucinate IDs.
    
    Menu:
    {menu_context}
    
    Structure the response as JSON exactly matching this schema:
    {{
      "ai_spoken_response": "Got it, I've added a Butter Chicken to your order. Would you like anything else?",
      "intent": "ORDER" or "INFO" or "COMPLAINT",
      "items": [
         {{ "menu_item_id": 1, "quantity": 1, "modifiers": "" }}
      ]
    }}
    
    Return ONLY valid, raw JSON. Do not return any other text.
    """
    
    # Format history for Groq
    messages = [{"role": "system", "content": system_prompt}]
    for msg in chat_history:
        role = "assistant" if msg["role"] == "ai" else "user"
        messages.append({"role": role, "content": msg["content"]})
        
    messages.append({"role": "user", "content": transcript})
    
    print("--- DEBUG process_conversation_turn ---")
    print("Current Cart:", current_cart)
    print("Messages:", messages)
    print("---------------------------------------")
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.1
    )
    
    output = response.choices[0].message.content
    print("LLM RESPONSE:", output)
    return output
