"""
In-memory storage for blockchain data (mock implementation).
Used when real smart contracts aren't deployed.
"""
from typing import Dict, List, Any
from datetime import datetime

# In-memory storage
consent_storage: Dict[str, Dict[str, bool]] = {}
consent_timestamps: Dict[str, Dict[str, int]] = {}
node_storage: Dict[str, Dict[str, Any]] = {}
node_ids: List[str] = []


def store_consent(patient_id: str, hospital_id: str, granted: bool):
    """Store consent in memory."""
    if patient_id not in consent_storage:
        consent_storage[patient_id] = {}
        consent_timestamps[patient_id] = {}
    
    consent_storage[patient_id][hospital_id] = granted
    consent_timestamps[patient_id][hospital_id] = int(datetime.now().timestamp())


def get_consent(patient_id: str, hospital_id: str) -> bool:
    """Get consent from memory."""
    if patient_id in consent_storage and hospital_id in consent_storage[patient_id]:
        return consent_storage[patient_id][hospital_id]
    return False


def get_consent_timestamp(patient_id: str, hospital_id: str) -> int:
    """Get consent timestamp from memory."""
    if patient_id in consent_timestamps and hospital_id in consent_timestamps[patient_id]:
        return consent_timestamps[patient_id][hospital_id]
    return 0


def store_node(node_id: str, hospital_name: str, public_key: str):
    """Store node in memory."""
    if node_id not in node_storage:
        node_ids.append(node_id)
    
    node_storage[node_id] = {
        'hospital_name': hospital_name,
        'public_key': public_key,
        'is_verified': True,
        'registration_time': int(datetime.now().timestamp())
    }


def get_node(node_id: str) -> Dict[str, Any]:
    """Get node from memory."""
    return node_storage.get(node_id, {})


def get_all_node_ids() -> List[str]:
    """Get all node IDs from memory."""
    return node_ids.copy()


def verify_node(node_id: str) -> bool:
    """Check if node is verified."""
    if node_id in node_storage:
        return node_storage[node_id].get('is_verified', False)
    return False
