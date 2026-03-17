import os
from dotenv import load_dotenv
from google import genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

print("\nFetching models from Gemini SDK...\n")

models = client.models.list()

valid_models = []

for m in models:
    name = m.name.replace("models/", "")

    # Only keep embedding models
    if "embed" in name.lower():
        try:
            # Try initializing in LangChain
            GoogleGenerativeAIEmbeddings(model=name)
            valid_models.append(name)
        except Exception:
            pass


print("✅ Models supported by BOTH SDK + LangChain:\n")

if not valid_models:
    print("❌ None found (SDK/LangChain mismatch)")
else:
    for m in valid_models:
        print("✔", m)

print("\nDone.")