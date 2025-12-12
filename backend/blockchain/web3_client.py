"""
Web3 client for connecting to Ethereum blockchain.
Provides shared Web3 instance and contract interfaces.
"""
from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import os
from pathlib import Path
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Configuration
RPC_URL = os.getenv('WEB3_RPC_URL', 'http://127.0.0.1:8545')
CONSENT_CONTRACT_ADDRESS = os.getenv('CONSENT_CONTRACT_ADDRESS', '')
NODE_REGISTRY_ADDRESS = os.getenv('NODE_REGISTRY_ADDRESS', '')

print(f"🔗 Web3 Config: RPC={RPC_URL}")
print(f"📝 Consent Contract: {CONSENT_CONTRACT_ADDRESS}")
print(f"📝 Node Registry: {NODE_REGISTRY_ADDRESS}")

# Initialize Web3 with timeout
w3 = Web3(Web3.HTTPProvider(RPC_URL, request_kwargs={'timeout': 5}))

# Add PoA middleware for Ganache compatibility
try:
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
except Exception as e:
    logger.warning(f"Could not inject PoA middleware: {e}")

# Contract ABIs (will be loaded from compiled contracts)
CONSENT_ABI = None
NODE_REGISTRY_ABI = None

# Contract instances
consent_contract = None
node_registry_contract = None


def load_contract_abi(contract_name):
    """Load contract ABI from compiled JSON file."""
    abi_path = Path(__file__).parent / f"{contract_name}_abi.json"
    if abi_path.exists():
        with open(abi_path, 'r') as f:
            return json.load(f)
    return None


def initialize_contracts():
    """Initialize contract instances with ABIs and addresses."""
    global consent_contract, node_registry_contract, CONSENT_ABI, NODE_REGISTRY_ABI
    
    # Load ABIs
    CONSENT_ABI = load_contract_abi('consent_contract')
    NODE_REGISTRY_ABI = load_contract_abi('node_registry')
    
    # Initialize contracts if addresses are available
    if CONSENT_CONTRACT_ADDRESS and CONSENT_ABI:
        consent_contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONSENT_CONTRACT_ADDRESS),
            abi=CONSENT_ABI
        )
    
    if NODE_REGISTRY_ADDRESS and NODE_REGISTRY_ABI:
        node_registry_contract = w3.eth.contract(
            address=Web3.to_checksum_address(NODE_REGISTRY_ADDRESS),
            abi=NODE_REGISTRY_ABI
        )


def is_connected():
    """Check if Web3 is connected to blockchain."""
    try:
        return w3.is_connected()
    except Exception as e:
        print(f"Web3 connection error: {e}")
        return False


def get_account():
    """Get the default account for transactions."""
    if w3.eth.accounts:
        return w3.eth.accounts[0]
    return None


def get_balance(address):
    """Get ETH balance of an address."""
    return w3.eth.get_balance(Web3.to_checksum_address(address))


# Initialize contracts on module import
initialize_contracts()
