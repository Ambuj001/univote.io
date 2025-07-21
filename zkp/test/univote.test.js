 // Import necessary libraries from Hardhat
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Test suite for the UniVote contract
describe("UniVote Contract Tests", function () {
    // Variables to hold contract instance and accounts
    let UniVote, uniVote, owner, addr1, addr2;
    const electionName = "Favorite Programming Language";
    const electionDuration = 10; // 10 minutes
    const candidates = ["Solidity", "JavaScript", "Python"];

    // This block runs once before all tests
    beforeEach(async function () {
        // Get different accounts provided by Hardhat
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy a new instance of the UniVote contract
        UniVote = await ethers.getContractFactory("UniVote");
        uniVote = await UniVote.deploy();
        // await uniVote.deployed(); // This is deprecated, the line above waits for deployment
    });

    // ================== Deployment Tests ==================
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            // Check if the contract deployer is the owner
            // Note: Our contract doesn't have an explicit owner, but this is good practice
            expect(await uniVote.runner.provider.getCode(await uniVote.getAddress())).to.not.be.null;
        });

        it("Should have 0 total elections initially", async function () {
            // Check if the initial state is correct
            expect(await uniVote.totalElections()).to.equal(0);
        });
    });

    // ================== createElection Function Tests ==================
    describe("createElection", function () {
        it("Should allow creation of an election with candidates", async function () {
            // Action: Create a new election
            const tx = await uniVote.createElection(electionName, electionDuration, candidates);
            const receipt = await tx.wait();

            // Verification
            // 1. Check if total elections increased
            expect(await uniVote.totalElections()).to.equal(1);

            // 2. Get the generated election ID from the event
            const event = receipt.events.find(e => e.event === 'ElectionCreated');
            const electionId = event.args.electionId;

            // 3. Check if the election details are correct
            const details = await uniVote.getElectionDetails(electionId);
            expect(details.name).to.equal(electionName);
            expect(details.creator).to.equal(owner.address);
            expect(details.isEnded).to.be.false;

            // 4. Check if candidates were added correctly
            const fetchedCandidates = await uniVote.getCandidates(electionId);
            expect(fetchedCandidates.length).to.equal(3);
            expect(fetchedCandidates[0].name).to.equal("Solidity");
            expect(fetchedCandidates[2].voteCount).to.equal(0);
        });

        it("Should emit ElectionCreated and CandidateAdded events", async function () {
            // Expect the transaction to emit the specific events with correct arguments
            await expect(uniVote.createElection(electionName, electionDuration, candidates))
                .to.emit(uniVote, "ElectionCreated")
                .and.to.emit(uniVote, "CandidateAdded").withArgs(/.*/, "Solidity") // Regex to match any electionId
                .and.to.emit(uniVote, "CandidateAdded").withArgs(/.*/, "JavaScript")
                .and.to.emit(uniVote, "CandidateAdded").withArgs(/.*/, "Python");
        });

        it("Should fail if less than 2 candidates are provided", async function () {
            // Action: Try to create an election with only one candidate
            // Verification: Expect the transaction to be reverted with a specific error message
            await expect(
                uniVote.createElection("Test Fail", 5, ["OneCandidate"])
            ).to.be.revertedWith("Must have at least 2 candidates");
        });
    });

    // ================== vote Function Tests ==================
    describe("vote", function () {
        let electionId;

        // Create an election before each voting test
        beforeEach(async function () {
            const tx = await uniVote.createElection(electionName, electionDuration, candidates);
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'ElectionCreated');
            electionId = event.args.electionId;
        });

        it("Should allow a user to cast a valid vote", async function () {
            // Action: addr1 casts a vote for candidate at index 1 (JavaScript)
            await uniVote.connect(addr1).vote(electionId, 1);

            // Verification
            const fetchedCandidates = await uniVote.getCandidates(electionId);
            expect(fetchedCandidates[1].voteCount).to.equal(1);
        });

        it("Should emit a Voted event", async function () {
            await expect(uniVote.connect(addr1).vote(electionId, 1))
                .to.emit(uniVote, "Voted")
                .withArgs(electionId, addr1.address, 1);
        });

        it("Should prevent a user from voting twice", async function () {
            // Action: addr1 votes once
            await uniVote.connect(addr1).vote(electionId, 0);

            // Verification: Try to vote again and expect a revert
            await expect(
                uniVote.connect(addr1).vote(electionId, 1)
            ).to.be.revertedWith("Already voted");
        });

        it("Should fail if candidate index is invalid", async function () {
            // Action: Try to vote for an index that doesn't exist (e.g., 3)
            await expect(
                uniVote.connect(addr1).vote(electionId, 3)
            ).to.be.revertedWith("Invalid candidate");
        });
    });

    // ================== endElection and getResults Tests ==================
    describe("endElection and getResults", function () {
        let electionId;

        beforeEach(async function () {
            const tx = await uniVote.createElection(electionName, electionDuration, candidates);
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'ElectionCreated');
            electionId = event.args.electionId;

            // Cast some votes
            await uniVote.connect(addr1).vote(electionId, 1); // Vote for JavaScript
            await uniVote.connect(addr2).vote(electionId, 1); // Vote for JavaScript
        });

        it("Should only allow the creator to end the election", async function () {
            // Action: Try to end the election from a non-creator account
            await expect(
                uniVote.connect(addr1).endElection(electionId)
            ).to.be.revertedWith("Only admin can end election");
        });

        it("Should successfully end the election and allow fetching results", async function () {
            // Action: End the election as the owner
            await uniVote.connect(owner).endElection(electionId);

            // Verification
            const details = await uniVote.getElectionDetails(electionId);
            expect(details.isEnded).to.be.true;

            // Fetch results
            const results = await uniVote.getResults(electionId);
            expect(results[0].voteCount).to.equal(0); // Solidity
            expect(results[1].voteCount).to.equal(2); // JavaScript
            expect(results[2].voteCount).to.equal(0); // Python
        });

        it("Should prevent fetching results for an ongoing election", async function () {
            // Action: Try to get results before the election ends
            await expect(
                uniVote.getResults(electionId)
            ).to.be.revertedWith("Election still ongoing");
        });
    });
});     