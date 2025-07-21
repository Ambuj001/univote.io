 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Strings.sol";

contract UniVote {
    using Strings for uint256;

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        string id;
        string name;
        address creator;
        uint256 startTime;
        uint256 durationMinutes;
        bool isEnded;
        Candidate[] candidates;
        mapping(address => bool) hasVoted;
    }

    uint256 public totalElections;
    mapping(string => Election) private elections;
    mapping(string => bool) public electionExists;
    string[] public electionIds;

    // ===================== EVENTS =====================
    event ElectionCreated(string indexed electionId, address indexed creator);
    event CandidateAdded(string indexed electionId, string name); // Hum ise abhi bhi istemal kar sakte hain
    event Voted(string indexed electionId, address voter, uint256 candidateIndex);
    event ElectionEnded(string indexed electionId);

    // ===================== UTIL =====================
    function getLast4HexChars(address _addr) internal pure returns (string memory) {
        string memory full = Strings.toHexString(uint160(_addr));
        bytes memory b = bytes(full);
        bytes memory last4 = new bytes(4);
        for (uint256 i = 0; i < 4; i++) {
            last4[i] = b[b.length - 4 + i];
        }
        return string(last4);
    }

    // ===================== CORE FUNCTIONS (UPDATED) =====================
    
    /**
     * @notice Creates an election and adds all candidates in a single transaction.
     * @param name The name or topic of the election.
     * @param durationInMinutes The duration of the election in minutes.
     * @param candidateNames A list of names for all candidates.
     */
    function createElection(
        string memory name,
        uint256 durationInMinutes,
        string[] memory candidateNames // <-- NAYA: Candidates ki list yahan daalein
    ) external {
        totalElections += 1;
        string memory id = string(
            abi.encodePacked("univote-", getLast4HexChars(msg.sender), "-", totalElections.toString())
        );
        require(!electionExists[id], "Election ID already exists");
        require(candidateNames.length >= 2, "Must have at least 2 candidates");

        Election storage e = elections[id];
        e.id = id;
        e.name = name;
        e.creator = msg.sender;
        e.durationMinutes = durationInMinutes;
        e.startTime = block.timestamp;
        e.isEnded = false;

        // NAYA: Ek loop se saare candidates ko add karein
        for (uint256 i = 0; i < candidateNames.length; i++) {
            e.candidates.push(Candidate(candidateNames[i], 0));
            emit CandidateAdded(id, candidateNames[i]);
        }

        electionExists[id] = true;
        electionIds.push(id);

        emit ElectionCreated(id, msg.sender);
    }

    // PURANA `addCandidate` FUNCTION AB ZAROORI NAHI HAI.
    // Humne use hata diya hai.

    function vote(string memory electionId, uint256 candidateIndex) external {
        require(electionExists[electionId], "Election not found");
        Election storage e = elections[electionId];
        require(!e.isEnded, "Election ended");
        require(block.timestamp <= e.startTime + (e.durationMinutes * 60), "Election time over");
        require(!e.hasVoted[msg.sender], "Already voted");
        require(candidateIndex < e.candidates.length, "Invalid candidate");

        e.candidates[candidateIndex].voteCount += 1;
        e.hasVoted[msg.sender] = true;

        emit Voted(electionId, msg.sender, candidateIndex);
    }

    function endElection(string memory electionId) external {
        require(electionExists[electionId], "Election not found");
        Election storage e = elections[electionId];
        require(msg.sender == e.creator, "Only admin can end election");
        require(!e.isEnded, "Election already ended");

        e.isEnded = true;

        emit ElectionEnded(electionId);
    }

    // ===================== GETTERS (No changes needed here) =====================

    function getElectionDetails(string memory electionId) external view returns (
        string memory id,
        string memory name,
        address creator,
        uint256 startTime,
        uint256 durationMinutes,
        bool isEnded
    ) {
        require(electionExists[electionId], "Election not found");
        Election storage e = elections[electionId];
        return (
            e.id,
            e.name,
            e.creator,
            e.startTime,
            e.durationMinutes,
            e.isEnded
        );
    }

    function getCandidates(string memory electionId) external view returns (Candidate[] memory) {
        require(electionExists[electionId], "Election not found");
        return elections[electionId].candidates;
    }

    function getResults(string memory electionId) external view returns (Candidate[] memory) {
        require(electionExists[electionId], "Election not found");
        Election storage e = elections[electionId];
        require(e.isEnded || block.timestamp > e.startTime + (e.durationMinutes * 60), "Election still ongoing");
        return e.candidates;
    }

    function getAllElectionIds() external view returns (string[] memory) {
        return electionIds;
    }
}