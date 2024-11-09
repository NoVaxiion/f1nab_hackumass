import pinecone
import openai
import os
import re
from datetime import datetime
import time
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from difflib import get_close_matches

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize Pinecone client
pc = pinecone.Pinecone(api_key=PINECONE_API_KEY)
index_name = "hackumass"

# Check and create index if it doesn't exist
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=384,
        metric="cosine",
        spec=pinecone.ServerlessSpec(cloud="aws", region="us-east-1")
    )
index = pc.Index(index_name)

# Initialize OpenAI API key
openai.api_key = OPENAI_API_KEY

# Initialize embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Active context variables
active_race_context = {"season": None, "race_name": None}
initial_context_set = False
last_query_time = 0

# Valid race data
valid_races = ["Silverstone", "Monaco", "Austria", "Belgium", "Japan", "Abu Dhabi"]
valid_seasons = list(range(2000, datetime.now().year))
current_year = datetime.now().year

def suggest_alternatives(race_name):
    return get_close_matches(race_name, valid_races, n=3, cutoff=0.6)

def normalize_user_input(user_input):
    user_input = re.sub(r"what happened in", "tell me about", user_input, flags=re.IGNORECASE)
    user_input = re.sub(r"could you tell me about", "tell me about", user_input, flags=re.IGNORECASE)
    return user_input

def set_context(user_input):
    year_match = re.search(r"\b(20\d{2})\b", user_input)
    race_match = re.search(r"(Silverstone|Monaco|Austria|Belgium|Japan|Abu Dhabi|[other race names])", user_input, re.IGNORECASE)
    
    comparison_phrases = ["similar to", "like", "reminds me of", "compared to"]
    if any(phrase in user_input.lower() for phrase in comparison_phrases):
        print("Reference detected, not changing context.")
        return False

    if year_match:
        season = int(year_match.group())
        if season > current_year:
            print(f"The {season} season hasn't happened yet. Please choose a past season.")
            return False
        elif season == current_year:
            print(f"You're asking about the {season} season, which is ongoing. Some races may not have taken place yet.")
        elif season not in valid_seasons:
            print(f"Year {season} is not available. Please choose a season between 2000 and {current_year}.")
            return False
    else:
        print("No valid season specified.")
        return False

    if race_match:
        race_name = race_match.group().title()
        if race_name not in valid_races:
            suggestions = suggest_alternatives(race_name)
            if suggestions:
                print(f"Race '{race_name}' not found. Did you mean: {', '.join(suggestions)}?")
            else:
                print(f"Race '{race_name}' not found. Please specify a valid race.")
            return False
        else:
            active_race_context["season"] = season
            active_race_context["race_name"] = race_name
            print(f"Context set to {active_race_context['race_name']} {active_race_context['season']}")
            return True
    else:
        print("No valid race name specified.")
        return False

def initial_greeting_response():
    race_name = active_race_context["race_name"]
    season = active_race_context["season"]
    intro_prompt = f"Give a brief exciting opinion on the {race_name} {season} F1 race, as if you were recommending it to a fan."
    
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=intro_prompt,
        max_tokens=60
    )
    
    return f"{response['choices'][0]['text'].strip()} Enjoy the race and feel free to ask F1NAB anything you want about it!"

def retrieve_data_from_pinecone(query_text, context):
    if not context.get("season") or not context.get("race_name"):
        return "Please specify a valid season and race to retrieve information."
    
    query_embedding = model.encode(query_text).tolist()
    
    filter = {
        "season": context["season"],
        "race_name": context["race_name"]
    }
    
    response = index.query(vector=query_embedding, top_k=5, filter=filter)
    retrieved_data = [match["metadata"] for match in response["matches"]]
    
    return retrieved_data

def handle_query(user_input):
    global initial_context_set, last_query_time
    
    # Enforce cooldown period between queries
    if time.time() - last_query_time < 2:
        print("Please wait a moment before your next query.")
        return "Please wait a moment before your next query."
    last_query_time = time.time()
    
    # Normalize input
    user_input = normalize_user_input(user_input)
    
    # Check if user wants to reset context
    if user_input.lower() in ["reset context", "start over"]:
        active_race_context["season"] = None
        active_race_context["race_name"] = None
        initial_context_set = False
        return "Context reset. Please specify the race and year you're watching."
    
    # Handle first message or new context setup
    if not initial_context_set:
        if set_context(user_input):
            initial_context_set = True
            return initial_greeting_response()
    else:
        set_context(user_input)
    
    # Ensure context is fully set before querying
    if not active_race_context["season"] or not active_race_context["race_name"]:
        return "Please specify a valid season and race before asking further questions."

    retrieved_context = retrieve_data_from_pinecone(user_input, active_race_context)
    if isinstance(retrieved_context, str):
        return retrieved_context  # Return error message if context is incomplete
    
    context_text = " ".join([str(data) for data in retrieved_context])
    final_input = f"{context_text} {user_input}"
    
    # Send query to OpenAI
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=final_input,
        max_tokens=150
    )
    
    return response["choices"][0]["text"]

# Interactive testing loop
print("Welcome to F1NAB! Please specify the race and year you're watching.")
while True:
    user_question = input("\nYou: ")
    if user_question.lower() in ["exit", "quit"]:
        print("Exiting F1NAB. Goodbye!")
        break
    response_text = handle_query(user_question)
    print("Chatbot Response:", response_text)
