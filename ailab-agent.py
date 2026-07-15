import os
import sys
import json
import urllib.request
import urllib.error

PROJECT = "/data/data/com.termux/files/home/Sylvester's git repository/sylvesters-ai-lab"

def get_project_context():
    return "Project files loaded."

def ask_claude(prompt):
    # (Use the code provided previously for this function)
    pass

def agent_loop():
    print("🤖 Sylvester's AI Lab Agent")
    while True:
        instruction = input("You: ").strip()
        if instruction.lower() in ['quit', 'exit', 'q']:
            break
            
        context = get_project_context()
        
        # PROMPT IS DEFINED HERE, INSIDE THE FUNCTION
        prompt = (
            f"You are a Remotion motion graphics expert.\n\n"
            f"PROJECT FILES:\n{context}\n\n"
            f"INSTRUCTION FROM SYLVESTER:\n{instruction}"
        )
        print("Prompt successfully created.")

if __name__ == "__main__":
    agent_loop()
