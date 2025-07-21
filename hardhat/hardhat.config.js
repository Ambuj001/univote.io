// hardhat.config.js (Correct Version)

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Environment variables ko check karein
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.warn("Please make sure PRIVATE_KEY is set in your .env file");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    basesepolia: {
      url: "https://sepolia.base.org",
      // accounts array mein key daalein
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532
    },
    // Aap yahan aur bhi networks add kar sakte hain
  },
};




// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config(); // .env file ko load karne ke liye

// const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;

// if (!SEPOLIA_RPC_URL || !PRIVATE_KEY) {
//   console.warn("Please make sure SEPOLIA_RPC_URL and PRIVATE_KEY are set in your .env file");
// }

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.24",
//   networks: {
//     sepolia: {
//       url: SEPOLIA_RPC_URL || "",
//       accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
//       chainId: 11155111,
//     },
//   },
// };