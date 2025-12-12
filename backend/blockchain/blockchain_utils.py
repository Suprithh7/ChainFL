"""
Blockchain utilities for patient consent and node registry operations.
Provides high-level functions for interacting with smart contracts.
"""
from .web3_client import w3, consent_contract, node_registry_contract, get_account
from . import storage
from typing import Tuple, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


# ============= CONSENT MANAGEMENT =============

def grant_consent(patient_id: str, hospital_id: str) -> Tuple[bool, str]:
    """
    Grant patient consent for a hospital to use their data.
    
    Args:
        patient_id: Unique patient identifier
        hospital_id: Unique hospital identifier
        
    Returns:
        Tuple of (success: bool, transaction_hash: str)
    """
    try:
        if not consent_contract:
            return False, "Consent contract not initialized"
        
        account = get_account()
        if not account:
            return False, "No account available"
        
        # Use transact() directly - Ganache accounts are unlocked
        tx_hash = consent_contract.functions.grantConsent(
            patient_id, 
            hospital_id
        ).transact({'from': account})
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt['status'] == 1:
            # Store in memory
            storage.store_consent(patient_id, hospital_id, True)
            logger.info(f"Consent granted: {patient_id} -> {hospital_id}")
            return True, tx_hash.hex()
        else:
            return False, "Transaction failed"
            
    except Exception as e:
        logger.error(f"Error granting consent: {e}")
        return False, str(e)


def revoke_consent(patient_id: str, hospital_id: str) -> Tuple[bool, str]:
    """
    Revoke patient consent for a hospital.
    
    Args:
        patient_id: Unique patient identifier
        hospital_id: Unique hospital identifier
        
    Returns:
        Tuple of (success: bool, transaction_hash: str)
    """
    try:
        if not consent_contract:
            return False, "Consent contract not initialized"
        
        account = get_account()
        if not account:
            return False, "No account available"
        
        # Use transact() directly
        tx_hash = consent_contract.functions.revokeConsent(
            patient_id, 
            hospital_id
        ).transact({'from': account})
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt['status'] == 1:
            # Store in memory
            storage.store_consent(patient_id, hospital_id, False)
            logger.info(f"Consent revoked: {patient_id} -> {hospital_id}")
            return True, tx_hash.hex()
        else:
            return False, "Transaction failed"
            
    except Exception as e:
        logger.error(f"Error revoking consent: {e}")
        return False, str(e)


def has_consent(patient_id: str, hospital_id: str) -> bool:
    """
    Check if patient has granted consent to a hospital.
    
    Args:
        patient_id: Unique patient identifier
        hospital_id: Unique hospital identifier
        
    Returns:
        bool: True if consent is granted, False otherwise
    """
    try:
        # Check in-memory storage
        return storage.get_consent(patient_id, hospital_id)
        
    except Exception as e:
        logger.error(f"Error checking consent: {e}")
        return False


def get_consent_timestamp(patient_id: str, hospital_id: str) -> int:
    """Get timestamp of last consent action."""
    try:
        return storage.get_consent_timestamp(patient_id, hospital_id)
    except Exception as e:
        logger.error(f"Error getting consent timestamp: {e}")
        return 0


# ============= NODE REGISTRY =============

def register_node(node_id: str, hospital_name: str, public_key: str) -> Tuple[bool, str]:
    """
    Register a new hospital node in the blockchain registry.
    
    Args:
        node_id: Unique node identifier
        hospital_name: Name of the hospital
        public_key: Public key for the node
        
    Returns:
        Tuple of (success: bool, transaction_hash: str)
    """
    try:
        if not node_registry_contract:
            return False, "Node registry contract not initialized"
        
        account = get_account()
        if not account:
            return False, "No account available"
        
        # Use transact() directly
        tx_hash = node_registry_contract.functions.registerNode(
            node_id,
            hospital_name,
            public_key
        ).transact({'from': account})
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt['status'] == 1:
            # Store in memory
            storage.store_node(node_id, hospital_name, public_key)
            logger.info(f"Node registered: {node_id} - {hospital_name}")
            return True, tx_hash.hex()
        else:
            return False, "Transaction failed"
            
    except Exception as e:
        logger.error(f"Error registering node: {e}")
        return False, str(e)


def verify_node(node_id: str) -> bool:
    """
    Verify if a node is registered and verified.
    
    Args:
        node_id: Unique node identifier
        
    Returns:
        bool: True if node is verified, False otherwise
    """
    try:
        return storage.verify_node(node_id)
    except Exception as e:
        logger.error(f"Error verifying node: {e}")
        return False


def get_node_pubkey(node_id: str) -> str:
    """
    Get the public key of a registered node.
    
    Args:
        node_id: Unique node identifier
        
    Returns:
        str: Public key or empty string if not found
    """
    try:
        node = storage.get_node(node_id)
        return node.get('public_key', '')
    except Exception as e:
        logger.error(f"Error getting node public key: {e}")
        return ""


def get_node_details(node_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a node.
    
    Args:
        node_id: Unique node identifier
        
    Returns:
        Dict with node details
    """
    try:
        return storage.get_node(node_id)
    except Exception as e:
        logger.error(f"Error getting node details: {e}")
        return {}


def get_all_nodes() -> List[str]:
    """
    Get all registered node IDs.
    
    Returns:
        List of node IDs
    """
    try:
        return storage.get_all_node_ids()
    except Exception as e:
        logger.error(f"Error getting all nodes: {e}")
        return []
