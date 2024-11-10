import os
import google.generativeai as genai
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
import numpy as np


# Load environment variables from .env file
load_dotenv()


# Retrieve API keys from environment variables
gemini_api_key = os.getenv("GEMINI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")



# Configure Google Generative AI client
genai.configure(api_key=gemini_api_key)


# Initialize Pinecone client and connect to the existing "tester" index
pc = Pinecone(api_key=pinecone_api_key)
index = pc.Index("tester")


# Initialize SentenceTransformer model for vectorization
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')


# Function to pre-process documents and generate vectors
def document_to_vector(document):
   vector = sentence_model.encode(document)
   return vector


# Function to search for relevant documents based on vector similarity
def search_documents(query):
   query_vector = document_to_vector(query)
  
   # Ensure the query_vector is a numpy array and convert it to a list for serialization
   query_vector = np.array(query_vector).tolist()


   try:
       # Perform Pinecone search for the top 5 most relevant documents
       results = index.query(vector=query_vector, top_k=5)
      
       # Access the matches field and extract metadata properly
       matches = results.get("matches", [])
       if matches:
           return [match.get("metadata", {}) for match in matches]
       else:
           print("No matches found.")
           return []
   except Exception as e:
       print(f"Error during Pinecone search: {e}")
       return []


# Function to generate response using Gemini API
def generate_response_with_context(query, retrieved_data):
   context = "\n".join([f"{field}: {value}" for d in retrieved_data for field, value in d.items()])
   prompt = f"""
   User query: '{query}'


   Relevant information:
   {context}


   Provide a detailed and friendly response while using the provided Pinecone data for accuracy. If historical knowledge of Formula 1 is required (for instance, for a historic race), generate that response based on your internal knowledge. If the data from Pinecone matches the query, prioritize it. Please specify if the information is from your own knowledge or the data provided.
   """


   try:
       # Use the Gemini API to generate a response
       model = genai.GenerativeModel("gemini-1.5-flash")
       response = model.generate_content(prompt)


       return response.text
   except Exception as e:
       print(f"Error during response generation: {e}")
       return "Error: Unable to generate response from Gemini."


# Main function to handle user input and interaction
def main():
   while True:
       # Take user input for the query
       user_query = input("Please enter your query (or type 'exit' to quit): ")
      
       if user_query.lower() == "exit":
           print("Exiting the program.")
           break
      
       # Search Pinecone for relevant documents based on user query
       retrieved_data = search_documents(user_query)


       if retrieved_data:
           # Generate response with context using Gemini
           response = generate_response_with_context(user_query, retrieved_data)
           print("Gemini's response:")
           print(response)
       else:
           print("No relevant documents found in Pinecone.")


if __name__ == "__main__":
   main()
