"""
Smart contract deployment script.
Compiles and deploys consent and node registry contracts to Ganache.
"""
from solcx import compile_source, install_solc
from web3 import Web3
import json
from pathlib import Path
import os

# Install Solidity compiler
try:
    install_solc('0.8.0')
except:
    pass

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider(os.getenv('WEB3_RPC_URL', 'http://127.0.0.1:8545')))

def compile_contract(contract_file):
    """Compile a Solidity contract."""
    contract_path = Path(__file__).parent / contract_file
    
    with open(contract_path, 'r') as f:
        contract_source = f.read()
    
    compiled = compile_source(
        contract_source,
        output_values=['abi', 'bin']
    )
    
    # Get contract interface
    contract_id = list(compiled.keys())[0]
    contract_interface = compiled[contract_id]
    
    return contract_interface


def deploy_contract(contract_interface, contract_name):
    """Deploy a contract to the blockchain."""
    # Get account
    account = w3.eth.accounts[0]
    
    # Create contract instance
    Contract = w3.eth.contract(
        abi=contract_interface['abi'],
        bytecode=contract_interface['bin']
    )
    
    # Build transaction
    tx_hash = Contract.constructor().transact({'from': account})
    
    # Wait for receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    contract_address = tx_receipt.contractAddress
    
    print(f"✅ {contract_name} deployed at: {contract_address}")
    
    # Save ABI
    abi_path = Path(__file__).parent / f"{contract_name.lower()}_abi.json"
    with open(abi_path, 'w') as f:
        json.dump(contract_interface['abi'], f, indent=2)
    
    return contract_address, contract_interface['abi']


def main():
    """Main deployment function."""
    print("🚀 Starting contract deployment...")
    print(f"📡 Connected to: {w3.provider.endpoint_uri}")
    print(f"⛓️  Chain ID: {w3.eth.chain_id}")
    print(f"💰 Account: {w3.eth.accounts[0]}")
    print(f"💵 Balance: {w3.eth.get_balance(w3.eth.accounts[0]) / 10**18} ETH\n")
    
    # Deploy Consent Contract
    print("📝 Compiling PatientConsent contract...")
    consent_interface = compile_contract('consent_contract.sol')
    consent_address, consent_abi = deploy_contract(consent_interface, 'consent_contract')
    
    # Deploy Node Registry Contract
    print("\n📝 Compiling NodeRegistry contract...")
    registry_interface = compile_contract('node_registry.sol')
    registry_address, registry_abi = deploy_contract(registry_interface, 'node_registry')
    
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
    
    print("\n" + "="*60)
    print("✨ Deployment Complete!")
    print("="*60)
    print(f"\n📋 Contract Addresses:")
    print(f"   Consent Contract: {consent_address}")
    print(f"   Node Registry:    {registry_address}")
    print(f"\n💾 Deployment info saved to: {deployment_path}")
    print(f"\n🔧 Add these to your .env file:")
    print(f"   CONSENT_CONTRACT_ADDRESS={consent_address}")
    print(f"   NODE_REGISTRY_ADDRESS={registry_address}")
    
    return deployment_info


if __name__ == '__main__':
    if not w3.is_connected():
        print("❌ Error: Cannot connect to Ethereum node")
        print("   Make sure Ganache is running on http://127.0.0.1:8545")
        exit(1)
    
    main()
