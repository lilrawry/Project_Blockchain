// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditLog {
    enum Action { READ, CREATE, GRANT, REVOKE }

    struct Log {
        bytes32 logId;
        address caller;
        bytes32 recordId;
        Action action;
        uint256 timestamp;
    }

    mapping(address => bytes32[]) private userLogs;
    mapping(bytes32 => Log) private logs;
    
    address public admin;

    event ActionLogged(bytes32 indexed logId, address indexed caller, bytes32 indexed recordId, Action action, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    // Called by other contracts to log actions
    function logAction(address caller, bytes32 recordId, Action action) external {
        // In a real system, you'd restrict this to authorized contracts only
        bytes32 logId = keccak256(abi.encodePacked(caller, recordId, action, block.timestamp));
        
        Log memory newLog = Log({
            logId: logId,
            caller: caller,
            recordId: recordId,
            action: action,
            timestamp: block.timestamp
        });

        logs[logId] = newLog;
        userLogs[caller].push(logId);

        emit ActionLogged(logId, caller, recordId, action, block.timestamp);
    }

    function getUserLogs(address user) external view returns (bytes32[] memory) {
        return userLogs[user];
    }
    
    function getLogDetails(bytes32 logId) external view returns (Log memory) {
        return logs[logId];
    }
}
