 const { ethers } = require("hardhat");

async function main() {
  const UniVote = await ethers.getContractFactory("UniVote");
  const contract = await UniVote.deploy();  // deploy karo

  await contract.deployed();  // ✅ ethers v5: wait for deployment

  console.log("✅ UniVote deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
