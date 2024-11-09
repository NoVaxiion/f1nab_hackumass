import pinecone
import sqlite3
import openai
import re

pinecone.init(api_key="YOUR_PINECONE_API_KEY", environment="YOUR_PINECONE_ENVIRONMENT")
index = pinecone.Index("your-index-name")
openai.api_key = "YOUR_OPENAI_API_KEY"

conn = sqlite3.connect("f1_race_data.db")
cursor = conn.cursor()

def extract_query_context(query):
    year_match = re.search(r'\b(20\d{2})\b', query)
    race_match = re.search(r'\b(Silverstone|Monaco|Austrian|British|Italian|Brazilian|Australian|Canadian|French|Spanish|Belgian|Singapore|Japanese|Abu Dhabi|Dutch|Hungarian|Chinese|Bahrain|United States|German|Mexican)\b', query, re.IGNORECASE)
    driver_match = re.search(r'\b(Hamilton|Verstappen|Leclerc|Bottas|Norris|Perez|Sainz|Ricciardo|Russell|Gasly)\b', query, re.IGNORECASE)
    
    race_metadata = {}
    if year_match and race_match:
        race_metadata['season'] = year_match.group(0)
        race_metadata['race_name'] = race_match.group(0).title()
    if driver_match:
        race_metadata['driver_name'] = driver_match.group(0).title()
    
    return race_metadata

def get_relevant_data_from_pinecone(user_query, race_metadata=None):
    query_embedding = openai.Embedding.create(input=user_query, model="text-embedding-ada-002")["data"][0]["embedding"]
    
    metadata_filter = {}
    if race_metadata:
        if 'season' in race_metadata:
            metadata_filter['season'] = race_metadata['season']
        if 'race_name' in race_metadata:
            metadata_filter['race_name'] = race_metadata['race_name']
        if 'driver_name' in race_metadata:
            metadata_filter['driver_name'] = race_metadata['driver_name']

    response = index.query(
        vector=query_embedding,
        top_k=10,
        include_metadata=True,
        filter=metadata_filter if metadata_filter else None
    )
    
    retrieved_context = "\n".join([str(match['metadata']) for match in response['matches']])
    return retrieved_context

class RAGRaceChatbot:
    def __init__(self, max_history_tokens=1500):
        self.active_race_metadata = {}
        self.chat_history = []
        self.max_history_tokens = max_history_tokens

    def set_active_race(self, race_metadata):
        self.active_race_metadata = race_metadata
        print(f"Active race set with metadata {race_metadata}")

    def reset_active_race(self):
        self.active_race_metadata = {}

    def update_chat_history(self, user_query, bot_response):
        self.chat_history.append(f"User: {user_query}\nBot: {bot_response}")
        history_tokens = sum(len(message) for message in self.chat_history)

        while history_tokens > self.max_history_tokens:
            self.chat_history.pop(0)
            history_tokens = sum(len(message) for message in self.chat_history)

    def handle_query(self, user_query):
        if not self.active_race_metadata:
            self.active_race_metadata = extract_query_context(user_query)
        
        retrieved_context = get_relevant_data_from_pinecone(user_query, self.active_race_metadata)
        
        history_context = "\n".join(self.chat_history)
        augmented_prompt = f"{history_context}\nUser query: {user_query}\nContext:\n{retrieved_context}"

        openai_response = openai.Completion.create(
            model="text-davinci-003",
            prompt=augmented_prompt,
            max_tokens=150
        )
        bot_response = openai_response.choices[0].text.strip()
        
        self.update_chat_history(user_query, bot_response)
        return bot_response
    
# testing this shit if it fails I will tweak 

chatbot = RAGRaceChatbot()

user_question = "Why did Hamilton pit for softs in Austria 2021 in the final stage of the race?"
response = chatbot.handle_query(user_question)
print("Chatbot response:", response)

chatbot.reset_active_race()
general_question = "Who won the 2005 World Championship?"
response = chatbot.handle_query(general_question)
print("Chatbot response:", response)

conn.close()
