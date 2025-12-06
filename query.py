import os
import google.generativeai as genai
from dotenv import load_dotenv
from pinecone import Pinecone
import re


load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

genai.configure(api_key=gemini_api_key)
pc = Pinecone(api_key=pinecone_api_key)
index = pc.Index("tester")


current_race = None
chat_history = []

def set_race_context(race_name):
    """
    Sets the global race context.
    """
    global current_race
    current_race = race_name
    print(f"Race context set to: {current_race}")
    return f"The race context is now set to {current_race}. Feel free to ask specific questions about this race!"

def document_to_vector(document):
    """
    Generates embeddings using Gemini API.
    """
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=document,
            task_type="RETRIEVAL_QUERY"
        )
        return response["embedding"]
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0] * 768  # Default fallback vector

def search_documents(query):
    """
    Searches Pinecone using the vectorized form of the query.
    """
    query_vector = document_to_vector(query)

    try:
        results = index.query(vector=query_vector, top_k=5)
        matches = results.get("matches", [])
        return [match.get("metadata", {}) for match in matches if isinstance(match.get("metadata"), dict)]
    except Exception as e:
        print(f"Error during Pinecone search: {e}")
        return []

def generate_response_with_context(query, retrieved_data):
    """
    Generates a response using Gemini API with context provided by Pinecone data.
    """
    race_info = current_race if current_race else "an unspecified race"

    context_details = ""
    if retrieved_data:
        context_details = "\n".join([
            f"Race Name: {d.get('race_name', '')}, Driver: {d.get('driver_name', '')}, "
            f"Lap Count: {d.get('lap_count', '')}, Lap Time: {d.get('lap_time', '')}"
            for d in retrieved_data if isinstance(d, dict)
        ])

    # Clean up extraneous commas or empty fields
    context_details = re.sub(r",\s+", ", ", context_details)
    context_details = context_details.replace(", None", "").replace("None", "").strip()

    prompt = f"""
    You are assisting a user with questions about the {race_info} in Formula 1.

    User query: '{query}'

    Relevant information from Pinecone (if available):
    {context_details}

    Based on this information, please provide a detailed and accurate response about the {race_info}.
    If there is no specific data from Pinecone, use your own knowledge to answer the query without mentioning Pinecone.
    """

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")


        response = model.generate_content(prompt)
        # Remove any asterisks from the response text
        return response.text.replace("**", "")
    except Exception as e:
        import traceback
        print("Gemini exception:\n", traceback.format_exc())
        return f"Error: Unable to generate response from Gemini. ({e})"


def add_to_chat_history(query, response):
    """
    Adds a new query-response pair to the chat history with FIFO handling.
    """
    global chat_history
    if len(chat_history) >= 5:
        chat_history.pop(0)
    chat_history.append({"query": query, "response": response})

def process_query(query_text):
    """
    Processes a query by searching Pinecone and generating a response.
    """
    global current_race

   
    if not current_race:
        
        set_race_context(query_text)
        return f"Race context set to: {current_race}. Feel free to ask specific questions about this race!"

    
    retrieved_data = search_documents(query_text)
    response = generate_response_with_context(query_text, retrieved_data)
    add_to_chat_history(query_text, response)
    return response