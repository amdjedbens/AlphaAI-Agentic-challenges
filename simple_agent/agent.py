"""
Simple Agentic System
A minimal agent that can reason and use tools to accomplish tasks.
"""

import os
import json
from openai import OpenAI

# Configuration
OPENAI_API_KEY = "os.getenv("OPENAI_API_KEY")"

client = OpenAI(api_key=OPENAI_API_KEY)

# =============================================================================
# TOOLS - Functions the agent can call
# =============================================================================

def calculate(expression: str) -> str:
    """Safely evaluate a math expression."""
    try:
        # Only allow safe math operations
        allowed = set("0123456789+-*/.() ")
        if all(c in allowed for c in expression):
            result = eval(expression)
            return f"Result: {result}"
        return "Error: Invalid expression"
    except Exception as e:
        return f"Error: {str(e)}"

def get_weather(city: str) -> str:
    """Simulated weather lookup."""
    # In a real system, this would call a weather API
    weather_data = {
        "new york": "☀️ Sunny, 72°F",
        "london": "🌧️ Rainy, 55°F", 
        "tokyo": "⛅ Partly cloudy, 68°F",
        "paris": "🌤️ Clear, 65°F",
    }
    return weather_data.get(city.lower(), f"Weather data not available for {city}")

def search_knowledge(query: str) -> str:
    """Simulated knowledge search."""
    knowledge = {
        "python": "Python is a high-level programming language known for readability.",
        "ai": "AI (Artificial Intelligence) enables machines to learn and make decisions.",
        "agent": "An AI agent is a system that can perceive, reason, and take actions autonomously.",
    }
    for key, value in knowledge.items():
        if key in query.lower():
            return value
    return "No relevant information found."

def create_note(title: str, content: str) -> str:
    """Create a note/reminder."""
    return f"📝 Note created!\nTitle: {title}\nContent: {content}"

# Tool definitions for OpenAI
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Perform mathematical calculations",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Math expression to evaluate, e.g., '2 + 2 * 3'"}
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function", 
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"}
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_knowledge",
            "description": "Search for information on a topic",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_note",
            "description": "Create a note or reminder",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Note title"},
                    "content": {"type": "string", "description": "Note content"}
                },
                "required": ["title", "content"]
            }
        }
    }
]

# Map function names to actual functions
TOOL_MAP = {
    "calculate": calculate,
    "get_weather": get_weather,
    "search_knowledge": search_knowledge,
    "create_note": create_note,
}

# =============================================================================
# AGENT
# =============================================================================

class SimpleAgent:
    def __init__(self):
        self.messages = [
            {
                "role": "system",
                "content": """You are a helpful AI agent. You can use tools to help users:
- calculate: Do math calculations
- get_weather: Check weather in cities
- search_knowledge: Look up information
- create_note: Create notes/reminders

Think step by step. Use tools when helpful. Be concise and friendly."""
            }
        ]
    
    def execute_tool(self, name: str, args: dict) -> str:
        """Execute a tool and return result."""
        if name in TOOL_MAP:
            return TOOL_MAP[name](**args)
        return f"Unknown tool: {name}"
    
    def run(self, user_input: str) -> str:
        """Process user input and return response."""
        self.messages.append({"role": "user", "content": user_input})
        
        while True:
            # Call the model
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=self.messages,
                tools=TOOLS,
                tool_choice="auto"
            )
            
            message = response.choices[0].message
            self.messages.append(message)
            
            # Check if model wants to use tools
            if message.tool_calls:
                print("\n🔧 Agent is using tools...")
                
                for tool_call in message.tool_calls:
                    name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    print(f"   → {name}({args})")
                    result = self.execute_tool(name, args)
                    print(f"   ← {result}")
                    
                    # Add tool result to messages
                    self.messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result
                    })
            else:
                # No more tool calls, return final response
                return message.content

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 50)
    print("🤖 Simple Agentic System")
    print("=" * 50)
    print("\nI can help you with:")
    print("  • Math calculations")
    print("  • Weather lookups")
    print("  • Knowledge search")
    print("  • Creating notes")
    print("\nType 'quit' to exit.\n")
    
    agent = SimpleAgent()
    
    while True:
        user_input = input("You: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Goodbye!")
            break
        
        if not user_input:
            continue
        
        try:
            response = agent.run(user_input)
            print(f"\n🤖 Agent: {response}\n")
        except Exception as e:
            print(f"\n❌ Error: {e}\n")

if __name__ == "__main__":
    main()

