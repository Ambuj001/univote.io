   const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniVote", function () {
  let UniVote, univote, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    UniVote = await ethers.getContractFactory("UniVote");
    univote = await UniVote.deploy(); // ❌ no .deployed() here
  });

  it("should allow anyone to create an election", async function () {
    const tx = await univote.connect(addr1).createElection("Test Election", 3);
    await tx.wait();

    const ids = await univote.getAllElectionIds();
    expect(ids.length).to.equal(1);

    const details = await univote.getElectionDetails(ids[0]);
    expect(details.name).to.equal("Test Election");
    expect(details.creator).to.equal(addr1.address);
  });

  it("should follow correct ID format", async function () {
    await univote.connect(addr1).createElection("Election X", 5);
    const ids = await univote.getAllElectionIds();
    expect(ids[0]).to.match(/^univote-[A-Fa-f0-9]{4}-\d+$/);
  });

  it("should allow admin to add candidates", async function () {
    await univote.connect(owner).createElection("Admin Election", 5);
    const ids = await univote.getAllElectionIds();
    await univote.connect(owner).addCandidate(ids[0], "Alice");
    await univote.connect(owner).addCandidate(ids[0], "Bob");

    const candidates = await univote.getCandidates(ids[0]);
    expect(candidates.length).to.equal(2);
    expect(candidates[0].name).to.equal("Alice");
  });

  it("should not allow non-admin to add candidates", async function () {
    await univote.connect(owner).createElection("Election Y", 5);
    const ids = await univote.getAllElectionIds();

    await expect(
      univote.connect(addr1).addCandidate(ids[0], "Hacker")
    ).to.be.revertedWith("Only admin can add candidates");
  });

  it("should allow voting and block double vote", async function () {
    await univote.connect(owner).createElection("VoteTest", 5);
    const ids = await univote.getAllElectionIds();
    const eid = ids[0];

    await univote.connect(owner).addCandidate(eid, "Alice");
    await univote.connect(owner).addCandidate(eid, "Bob");

    await univote.connect(addr1).vote(eid, 0); // vote Alice

    await expect(
      univote.connect(addr1).vote(eid, 1)
    ).to.be.revertedWith("Already voted");
  });

  it("should not allow voting after time", async function () {
    await univote.connect(owner).createElection("TimedVote", 1);
    const ids = await univote.getAllElectionIds();
    const eid = ids[0];

    await univote.connect(owner).addCandidate(eid, "Alice");

    // Wait 65 seconds
    await ethers.provider.send("evm_increaseTime", [65]);
    await ethers.provider.send("evm_mine");

    await expect(
      univote.connect(addr1).vote(eid, 0)
    ).to.be.revertedWith("Election time over");
  });

  it("should let admin end election early", async function () {
    await univote.connect(owner).createElection("EndEarly", 5);
    const ids = await univote.getAllElectionIds();

    await expect(
      univote.connect(owner).endElection(ids[0])
    ).to.emit(univote, "ElectionEnded");
  });

  it("should not show results before election ends", async function () {
    await univote.connect(owner).createElection("NoEarlyResult", 1);
    const ids = await univote.getAllElectionIds();
    const eid = ids[0];

    await univote.connect(owner).addCandidate(eid, "Alice");

    await expect(
      univote.getResults(eid)
    ).to.be.revertedWith("Election still ongoing");
  });

  it("should show results after end", async function () {
    await univote.connect(owner).createElection("ResultTest", 1);
    const ids = await univote.getAllElectionIds();
    const eid = ids[0];

    await univote.connect(owner).addCandidate(eid, "Alice");
    await univote.connect(addr1).vote(eid, 0);

    // Wait for time to expire
    await ethers.provider.send("evm_increaseTime", [65]);
    await ethers.provider.send("evm_mine");

    const results = await univote.getResults(eid);
    expect(results[0].voteCount).to.equal(1);
  });
});
