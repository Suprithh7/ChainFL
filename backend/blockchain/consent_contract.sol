// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PatientConsent
 * @dev Smart contract for managing patient consent for data usage by hospitals
 */
contract PatientConsent {
    
    // Mapping: patientID => hospitalID => hasConsent
    mapping(string => mapping(string => bool)) private consents;
    
    // Mapping: patientID => hospitalID => timestamp
    mapping(string => mapping(string => uint256)) private consentTimestamps;
    
    // Events
    event ConsentGranted(string indexed patientID, string indexed hospitalID, uint256 timestamp);
    event ConsentRevoked(string indexed patientID, string indexed hospitalID, uint256 timestamp);
    
    /**
     * @dev Grant consent for a hospital to use patient data
     * @param patientID Unique identifier for the patient
     * @param hospitalID Unique identifier for the hospital
     */
    function grantConsent(string memory patientID, string memory hospitalID) public {
        require(bytes(patientID).length > 0, "Patient ID cannot be empty");
        require(bytes(hospitalID).length > 0, "Hospital ID cannot be empty");
        
        consents[patientID][hospitalID] = true;
        consentTimestamps[patientID][hospitalID] = block.timestamp;
        
        emit ConsentGranted(patientID, hospitalID, block.timestamp);
    }
    
    /**
     * @dev Revoke consent for a hospital to use patient data
     * @param patientID Unique identifier for the patient
     * @param hospitalID Unique identifier for the hospital
     */
    function revokeConsent(string memory patientID, string memory hospitalID) public {
        require(bytes(patientID).length > 0, "Patient ID cannot be empty");
        require(bytes(hospitalID).length > 0, "Hospital ID cannot be empty");
        
        consents[patientID][hospitalID] = false;
        consentTimestamps[patientID][hospitalID] = block.timestamp;
        
        emit ConsentRevoked(patientID, hospitalID, block.timestamp);
    }
    
    /**
     * @dev Check if patient has granted consent to a hospital
     * @param patientID Unique identifier for the patient
     * @param hospitalID Unique identifier for the hospital
     * @return bool True if consent is granted, false otherwise
     */
    function hasConsent(string memory patientID, string memory hospitalID) public view returns (bool) {
        return consents[patientID][hospitalID];
    }
    
    /**
     * @dev Get the timestamp of the last consent action
     * @param patientID Unique identifier for the patient
     * @param hospitalID Unique identifier for the hospital
     * @return uint256 Timestamp of last consent action
     */
    function getConsentTimestamp(string memory patientID, string memory hospitalID) public view returns (uint256) {
        return consentTimestamps[patientID][hospitalID];
    }
}
