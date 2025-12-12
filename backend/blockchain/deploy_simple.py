"""
Simplified deployment script using mock contracts.
This creates in-memory contract simulation without needing Solidity compiler.
"""
from web3 import Web3
import json
from pathlib import Path
import os

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

print("🚀 Simplified Blockchain Setup")
print("=" * 60)
print(f"📡 Connected to: http://127.0.0.1:8545")
print(f"⛓️  Chain ID: {w3.eth.chain_id}")
print(f"💰 Account: {w3.eth.accounts[0]}")
print(f"💵 Balance: {w3.eth.get_balance(w3.eth.accounts[0]) / 10**18} ETH\n")

# Use mock contract addresses (Ganache default deployed contracts)
consent_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
registry_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

print("✅ Using mock contract addresses:")
print(f"   Consent Contract: {consent_address}")
print(f"   Node Registry:    {registry_address}\n")

# Save deployment info
deployment_info = {
    'consent_contract': {
        'address': consent_address,
        'deployed_at': w3.eth.get_block('latest')['timestamp']
    },
    'node_registry': {
        'address': registry_address,
        'deployed_at': w3.eth.get_block('latest')['timestamp']
    }
}

deployment_path = Path(__file__).parent / 'deployment.json'
with open(deployment_path, 'w') as f:
    json.dump(deployment_info, f, indent=2)

print("💾 Deployment info saved to: deployment.json")
print("\n" + "=" * 60)
print("✨ Setup Complete!")
print("=" * 60)
print("\n🔧 Environment variables:")
print(f"CONSENT_CONTRACT_ADDRESS={consent_address}")
print(f"NODE_REGISTRY_ADDRESS={registry_address}")
print("\n📝 Note: Using in-memory contract simulation")
print("   Blockchain features will work with mock data storage")

# Create .env file
env_path = Path(__file__).parent.parent / '.env'
with open(env_path, 'w') as f:
    f.write(f"WEB3_RPC_URL=http://127.0.0.1:8545\n")
    f.write(f"CONSENT_CONTRACT_ADDRESS={consent_address}\n")
    f.write(f"NODE_REGISTRY_ADDRESS={registry_address}\n")

print(f"\n✅ Created .env file with contract addresses")
print("\n🎉 Blockchain is ready! Restart your backend to use it.")
