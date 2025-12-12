// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title NodeRegistry
 * @dev Smart contract for managing hospital node registration and verification
 */
contract NodeRegistry {
    
    struct Node {
        string nodeID;
        string hospitalName;
        string publicKey;
        bool isVerified;
        uint256 registrationTime;
        address registeredBy;
    }
    
    // Mapping: nodeID => Node
    mapping(string => Node) private nodes;
    
    // Array of all registered node IDs
    string[] private nodeIDs;
    
    // Events
    event NodeRegistered(string indexed nodeID, string hospitalName, uint256 timestamp);
    event NodeVerified(string indexed nodeID, uint256 timestamp);
    event NodeRevoked(string indexed nodeID, uint256 timestamp);
    
    /**
     * @dev Register a new hospital node
     * @param nodeID Unique identifier for the node
     * @param hospitalName Name of the hospital
     * @param publicKey Public key for the node
     */
    function registerNode(
        string memory nodeID, 
        string memory hospitalName, 
        string memory publicKey
    ) public {
        require(bytes(nodeID).length > 0, "Node ID cannot be empty");
        require(bytes(hospitalName).length > 0, "Hospital name cannot be empty");
        require(bytes(publicKey).length > 0, "Public key cannot be empty");
        require(!nodes[nodeID].isVerified, "Node already registered");
        
        nodes[nodeID] = Node({
            nodeID: nodeID,
            hospitalName: hospitalName,
            publicKey: publicKey,
            isVerified: true,
            registrationTime: block.timestamp,
            registeredBy: msg.sender
        });
        
        nodeIDs.push(nodeID);
        
        emit NodeRegistered(nodeID, hospitalName, block.timestamp);
        emit NodeVerified(nodeID, block.timestamp);
    }
    
    /**
     * @dev Verify if a node is registered and verified
     * @param nodeID Unique identifier for the node
     * @return bool True if node is verified, false otherwise
     */
    function verifyNode(string memory nodeID) public view returns (bool) {
        return nodes[nodeID].isVerified;
    }
    
    /**
     * @dev Get the public key of a registered node
     * @param nodeID Unique identifier for the node
     * @return string Public key of the node
     */
    function getNodePublicKey(string memory nodeID) public view returns (string memory) {
        require(nodes[nodeID].isVerified, "Node not verified");
        return nodes[nodeID].publicKey;
    }
    
    /**
     * @dev Get node details
     * @param nodeID Unique identifier for the node
     * @return Node struct with all node information
     */
    function getNodeDetails(string memory nodeID) public view returns (
        string memory hospitalName,
        string memory publicKey,
        bool isVerified,
        uint256 registrationTime
    ) {
        Node memory node = nodes[nodeID];
        return (
            node.hospitalName,
            node.publicKey,
            node.isVerified,
            node.registrationTime
        );
    }
    
    /**
     * @dev Get all registered node IDs
     * @return string[] Array of all node IDs
     */
    function getAllNodeIDs() public view returns (string[] memory) {
        return nodeIDs;
    }
    
    /**
     * @dev Revoke a node's verification (admin function)
     * @param nodeID Unique identifier for the node
     */
    function revokeNode(string memory nodeID) public {
        require(nodes[nodeID].isVerified, "Node not verified");
        nodes[nodeID].isVerified = false;
        emit NodeRevoked(nodeID, block.timestamp);
    }
}
