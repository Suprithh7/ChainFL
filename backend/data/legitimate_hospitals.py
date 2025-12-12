"""
Legitimate Hospitals Database for ChainFL-Care
Hospitals verified for participation in the federated learning network.
"""

LEGITIMATE_HOSPITALS = [
    # Delhi (National Capital Territory)
    {
        "name": "All India Institute of Medical Sciences (AIIMS)",
        "city": "New Delhi",
        "state": "Delhi",
        "district": "South Delhi",
        "type": "Government",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Sir Ganga Ram Hospital",
        "city": "New Delhi",
        "state": "Delhi",
        "district": "Central Delhi",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Safdarjung Hospital",
        "city": "New Delhi",
        "state": "Delhi",
        "district": "South Delhi",
        "type": "Government",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Max Super Speciality Hospital",
        "city": "Saket, New Delhi",
        "state": "Delhi",
        "district": "South Delhi",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    
    # West Bengal
    {
        "name": "Desun Hospital",
        "city": "Kolkata",
        "state": "West Bengal",
        "district": "Kolkata",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Ruby General Hospital",
        "city": "Kolkata",
        "state": "West Bengal",
        "district": "Kolkata",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "AMRI Hospitals",
        "city": "Kolkata",
        "state": "West Bengal",
        "district": "Kolkata",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Medica North Bengal Clinic",
        "city": "Siliguri",
        "state": "West Bengal",
        "district": "Darjeeling",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    
    # Tamil Nadu
    {
        "name": "Rajiv Gandhi Government General Hospital",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "type": "Government",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Government Royapettah Hospital",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "type": "Government",
        "specialization": "Multi-specialty"
    },
    {
        "name": "MIOT Hospital",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Apollo Hospital",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    
    # Maharashtra
    {
        "name": "King Edward Memorial Hospital",
        "city": "Mumbai",
        "state": "Maharashtra",
        "district": "Mumbai",
        "type": "Government",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Apollo Hospital",
        "city": "Navi Mumbai",
        "state": "Maharashtra",
        "district": "Thane",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    
    # Karnataka
    {
        "name": "Manipal Hospitals",
        "city": "Bangalore",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Narayana Health",
        "city": "Bangalore",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "type": "Private",
        "specialization": "Multi-specialty"
    },
    {
        "name": "Kidwai Memorial Institute of Oncology",
        "city": "Bengaluru",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "type": "Government",
        "specialization": "Oncology"
    },
    
    # Odisha
    {
        "name": "All India Institute of Medical Sciences (AIIMS)",
        "city": "Bhubaneswar",
        "state": "Odisha",
        "district": "Khordha",
        "type": "Government",
        "specialization": "Multi-specialty"
    },
    
    # Punjab
    {
        "name": "Fortis Hospital",
        "city": "Mohali",
        "state": "Punjab",
        "district": "Mohali",
        "type": "Private",
        "specialization": "Multi-specialty"
    }
]

# Extract unique states and districts for filters
STATES = sorted(list(set(h["state"] for h in LEGITIMATE_HOSPITALS)))
DISTRICTS_BY_STATE = {}
for hospital in LEGITIMATE_HOSPITALS:
    state = hospital["state"]
    if state not in DISTRICTS_BY_STATE:
        DISTRICTS_BY_STATE[state] = set()
    DISTRICTS_BY_STATE[state].add(hospital["district"])

# Convert sets to sorted lists
for state in DISTRICTS_BY_STATE:
    DISTRICTS_BY_STATE[state] = sorted(list(DISTRICTS_BY_STATE[state]))


def verify_hospital(hospital_name: str, state: str = None, district: str = None) -> dict:
    """
    Verify if a hospital is in the legitimate hospitals list.
    
    Args:
        hospital_name: Name of the hospital
        state: Optional state filter
        district: Optional district filter
        
    Returns:
        dict with verification status and hospital details
    """
    # Normalize hospital name for comparison
    normalized_name = hospital_name.lower().strip()
    
    for hospital in LEGITIMATE_HOSPITALS:
        hospital_normalized = hospital["name"].lower().strip()
        
        # Check if hospital name matches (fuzzy matching)
        if normalized_name in hospital_normalized or hospital_normalized in normalized_name:
            # Check state and district if provided
            if state and hospital["state"] != state:
                continue
            if district and hospital["district"] != district:
                continue
                
            return {
                "verified": True,
                "status": "verified",
                "hospital": hospital,
                "message": f"Hospital verified: {hospital['name']}"
            }
    
    return {
        "verified": False,
        "status": "flagged",
        "hospital": None,
        "message": f"Hospital '{hospital_name}' not found in legitimate hospitals database. Flagged for admin review."
    }


def get_hospitals_by_location(state: str = None, district: str = None) -> list:
    """Get list of legitimate hospitals filtered by location."""
    filtered = LEGITIMATE_HOSPITALS
    
    if state:
        filtered = [h for h in filtered if h["state"] == state]
    if district:
        filtered = [h for h in filtered if h["district"] == district]
    
    return filtered
