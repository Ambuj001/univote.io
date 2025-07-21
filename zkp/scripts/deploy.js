 const { ethers } = require("hardhat");

async function main() {
  const UniVote = await ethers.getContractFactory("UniVote");
  const contract = await UniVote.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ UniVote deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
