 require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.24",
  networks: {
    basesepolia: {
      url: "https://sepolia.base.org", // ✅ Base Sepolia RPC endpoint
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
