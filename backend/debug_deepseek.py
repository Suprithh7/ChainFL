"""
Debug DeepSeek API call
"""
import httpx
import json
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def test_deepseek_api():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    
    print(f"API Key: {api_key[:15]}... (length: {len(api_key)})")
    print("\nTesting DeepSeek API call...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Say 'Hello' in JSON format: {\"message\": \"...\"}"}
                    ],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                },
                timeout=30.0
            )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            print("\n✅ DeepSeek API is working!")
        else:
            print(f"\n❌ API Error: {response.status_code}")
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")

asyncio.run(test_deepseek_api())
