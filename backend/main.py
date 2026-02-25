from fastapi import FastAPI, HTTPException # HTTPException: A special error tool. Instead of crashing your server when things go wrong, this lets you send specific "Error Codes" (like 404 or 500) back to the user so the frontend knows what happened.
from pydantic import BaseModel # This is the "Blueprint" class.
from typing import List, Optional # Python is usually "lazy" about types (it doesn't care if x is a number or text). These tools let us be strict. List means "must be an array," and Optional means "this field might be missing, and that's okay."
from huggingface_hub import InferenceClient
import os # It allows Python to talk to your computer's internal system variables (like reading secret keys from memory).
from dotenv import load_dotenv # A helper tool that reads your local .env file and loads those variables into the os system we just imported.
from fastapi.middleware.cors import CORSMiddleware # CORS = Cross-Origin Resource Sharing. This is the security guard. By default, browsers block your React app (port 5173) from talking to your Python app (port 8000). This tool lets us tell the guard to "open the gate."


# 1. Load the environment variables (API Key)
load_dotenv() # It looks for a .env file in the same folder and temporarily saves it into your computer's RAM.
              # This keeps secrets out of your code. If you upload main.py to GitHub, your key is safe because the .env file is usually ignored by Git.

HF_TOKEN = os.getenv("HF_ACCESS_TOKEN") # Python asks the computer: "Do you have a variable named HF_ACCESS_TOKEN in RAM?"
                                        # Result: The secret key is stored in the variable HF_TOKEN.

# 2. Setup the AI Client
# We check if the key exists to avoid crashing later
if not HF_TOKEN:
    raise ValueError("HF_ACCESS_TOKEN is missing. Check your .env file.")

client = InferenceClient(token=HF_TOKEN) # Changed api_key to token # We turn on the AI connection. We give it our ID card (the Token). Now, anytime we use client, it knows who we are.



app = FastAPI() # You are instantiating the application. app is your website.


app.add_middleware(  # Middleware is code that runs on every single request before it reaches your functions. It's like security screening at an airport.
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], # Allow all types (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)


# 3. The Prompt Engineering 
SYSTEM_PROMPT = """
You are a helpful cooking assistant who creates recipes based on a list of ingredients.

CRITICAL FORMATTING RULES (Markdown):
1. Use ## for the Recipe Title.
2. Immediately after the title, write the Servings on a new line (e.g., "**Servings:** 4").
3. Use ### for section headers (e.g., ### Ingredients, ### Instructions).
4. Use - (bullet points) for lists.
5. Do NOT use standard numbering (1. 2. 3.) for instructions; use bullet points or bold steps instead.
6. Put each instruction on a new line with a blank line between them.
7. At the very end, include a section: ### Estimated Nutritional Information (per serving).
8. NO preamble text (like "Here is a recipe"). Start directly with the Title.

Your Goal: Return a clean, structured Markdown string that renders beautifully on a website.
"""

class RecipeRequest(BaseModel):
    ingredients: List[str]
    custom_requirement: Optional[str] = None
    servings: Optional[str] = None

@app.get("/")
def home():
    return {"message": "Recipe AI Backend is Online"} # Returns a Python Dictionary. FastAPI automatically converts this to JSON so the browser can read it.



@app.post("/generate-recipe") # We use POST because we are sending data (ingredients) to the server.
def generate_recipe(request: RecipeRequest): # FastAPI sees RecipeRequest. It grabs the incoming JSON, validates it against your Class rules, and if it passes, it gives you a nice Python object called request.
    # 4. Construct the User Message
    ingredients_str = ", ".join(request.ingredients) # Takes the list ['chicken', 'rice'] and turns it into one string: "chicken, rice". The AI needs a single string, not a list.
    user_message = f"I have {ingredients_str}. Please give me a recipe."

    if request.custom_requirement: # We check if custom_requirement exists (is not None). If it exists, we append it to the message we are about to send the AI.
        user_message += f"\nIMPORTANT DIETARY REQUIREMENT: {request.custom_requirement}."
    
    if request.servings:
        user_message += f"\nPlease aim for {request.servings} servings."

    try:
        # 5. Call the AI Model (Synchronous call for now)
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-7B-Instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT}, # system: The rules (formatting).
                {"role": "user", "content": user_message}, # user: The actual request (ingredients).
            ],
            max_tokens=1024, # "Don't write more than ~700 words."
            temperature=0.7 # "Be reasonably creative (0.7), but not totally random (1.0) or robotic (0.0)."
        )
        
        # 6. Extract the answer
        recipe_text = response.choices[0].message.content
        return {"recipe": recipe_text} #Digs into the complex response object from Hugging Face to find the actual text string we want, then returns it as JSON.

    except Exception as e:
        # If something goes wrong, return a 500 error
        print(f"Error generating recipe: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recipe from AI.") # The professional way to handle errors.