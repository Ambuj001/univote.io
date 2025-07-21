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
    event CandidateAdded(string indexed electionId, string name);
    event Voted(string indexed electionId, address voter, uint candidateIndex);
    event ElectionEnded(string indexed electionId);

    // ===================== UTIL =====================
    function getLast4HexChars(address _addr) internal pure returns (string memory) {
        string memory full = Strings.toHexString(uint160(_addr));
        bytes memory b = bytes(full);
        bytes memory last4 = new bytes(4);
        for (uint i = 0; i < 4; i++) {
            last4[i] = b[b.length - 4 + i];
        }
        return string(last4);
    }

    // ===================== CORE FUNCTIONS =====================
    function createElection(string memory name, uint256 durationInMinutes) external {
        totalElections += 1;
        string memory id = string(
            abi.encodePacked("univote-", getLast4HexChars(msg.sender), "-", totalElections.toString())
        );
        require(!electionExists[id], "Election ID already exists");

        Election storage e = elections[id];
        e.id = id;
        e.name = name;
        e.creator = msg.sender;
        e.durationMinutes = durationInMinutes;
        e.startTime = block.timestamp;
        e.isEnded = false;

        electionExists[id] = true;
        electionIds.push(id);

        emit ElectionCreated(id, msg.sender);
    }

    function addCandidate(string memory electionId, string memory name) external {
        require(electionExists[electionId], "Election not found");
        Election storage e = elections[electionId];
        require(msg.sender == e.creator, "Only admin can add candidates");
        require(!e.isEnded, "Election already ended");

        e.candidates.push(Candidate(name, 0));
        emit CandidateAdded(electionId, name);
    }

    function vote(string memory electionId, uint candidateIndex) external {
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

    // ===================== GETTERS =====================

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
        Election storage e = elections[electionId];
        Candidate[] memory result = new Candidate[](e.candidates.length);
        for (uint i = 0; i < e.candidates.length; i++) {
            result[i] = e.candidates[i];
        }
        return result;
    }

    function getResults(string memory electionId) external view returns (Candidate[] memory) {
        require(electionExists[electionId], "Election not found");
        Election storage e = elections[electionId];
        require(e.isEnded || block.timestamp > e.startTime + (e.durationMinutes * 60), "Election still ongoing");

        Candidate[] memory result = new Candidate[](e.candidates.length);
        for (uint i = 0; i < e.candidates.length; i++) {
            result[i] = e.candidates[i];
        }
        return result;
    }

    function getAllElectionIds() external view returns (string[] memory) {
        return electionIds;
    }
}
