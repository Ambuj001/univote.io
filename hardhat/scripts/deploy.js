// Hardhat aur ethers library ko import karein
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying UniVote contract...");

  // Contract ka "blueprint" ya factory hasil karein
  const UniVote = await ethers.getContractFactory("UniVote");

  // Contract ko deploy karna shuru karein
  const uniVote = await UniVote.deploy();

  // Contract ke poori tarah se deploy hone ka intezaar karein
  await uniVote.waitForDeployment(); // ethers v6+ mein naya tareeka

  // Deploy hue contract ka address hasil karein
  const contractAddress = await uniVote.getAddress(); // ethers v6+ mein naya tareeka
  
  console.log("✅ UniVote contract successfully deployed to:", contractAddress);
}

// Main function ko call karein aur errors ko handle karein
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });