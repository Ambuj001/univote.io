const hre = require("hardhat");
const circomlib = require('circomlibjs');
const crypto = require('crypto');
require('dotenv').config(); // .env file se variables load karne ke liye

// =================================================================
// ===== YEH FUNCTIONS AAPKE BACKEND CODE SE BILKUL MATCH HONE CHAHIYE =====
// =================================================================

/**
 * Har user ke liye ek unique aur constant secret generate karta hai.
 */
function generateUserSecret(userId) {
  const masterSecret = process.env.VOTER_MASTER_SECRET;
  if (!masterSecret) {
    throw new Error("VOTER_MASTER_SECRET environment variable not set! Please check your .env file.");
  }
  const hash = crypto.createHmac('sha256', masterSecret)
    .update(userId)
    .digest('hex');
  return '0x' + hash;
}

/**
 * User ke secret se uska commitment banata hai.
 */
// function generateCommitmentFromSecret(poseidon, userSecret) {
//     if (!poseidon) throw new Error("Poseidon not initialized yet");
//     const hashOutput = poseidon([BigInt(userSecret)]);
//     return "0x" + poseidon.F.toString(hashOutput, 16); // Hex format mein return karein
// }


// Is purane function ko...
/*
function generateCommitmentFromSecret(poseidon, userSecret) {
    if (!poseidon) throw new Error("Poseidon not initialized yet");
    const hashOutput = poseidon([BigInt(userSecret)]);
    return "0x" + poseidon.F.toString(hashOutput, 16); // Hex format mein return karein
}
*/
function generateCommitmentFromSecret(poseidon, userSecret) {
  if (!poseidon) throw new Error("Poseidon not initialized yet");

  // poseidon ka output ek Uint8Array hota hai.
  const hashOutput = poseidon([BigInt(userSecret)]);

  // Ethers.js v6 ka istemaal karke Uint8Array ko hex string mein badlein
  const hexHash = hre.ethers.hexlify(hashOutput);

  // Ab is hex string ko 32 bytes me pad karein (yeh optional hai par acchi practice hai)
  // hexlify se mili value already padded honi chahiye, but yeh extra safety hai.
  const paddedCommitment = hre.ethers.zeroPadValue(hexHash, 32);

  return paddedCommitment;
}




// =================================================================
// ===== MAIN SCRIPT LOGIC =====
// =================================================================

async function main() {
  // ----------------- CONFIGURATION -----------------
  // Yahan apne deploy kiye gaye ZkpVoting contract ka address daalein
  const zkpVotingAddress = "0x3922877F1697B0449A51B682620F26bFB325Fa14";

  // Yahan us user ka email/ID daalein jise aap register karna chahte hain
  const userToRegister = 'testvoter@example.com';
  // --------------------------------------------------

  console.log(`Voter "${userToRegister}" ko register kiya ja raha hai...`);

  // Poseidon instance ko initialize karein
  const poseidon = await circomlib.buildPoseidon();

  // 1. User ke liye deterministic secret generate karein
  const userSecret = generateUserSecret(userToRegister);
  console.log(`Generated Secret: ${userSecret}`);

  // 2. Us secret se commitment banayein
  const commitmentToRegister = generateCommitmentFromSecret(poseidon, userSecret);
  console.log(`Generated Commitment to Register: ${commitmentToRegister}`);

  // Contract ka instance prapt karein
  const zkpVoting = await hre.ethers.getContractAt("ZkpVoting", zkpVotingAddress);
  console.log(`\nZkpVoting contract se interact kiya ja raha hai at: ${zkpVotingAddress}`);

  // Check karein ki commitment pehle se registered to nahi hai
  const isAlreadyRegistered = await zkpVoting.isRegistered(commitmentToRegister);
  if (isAlreadyRegistered) {
    console.log("✅ Yeh commitment pehle se hi contract mein registered hai. Kuch karne ki zaroorat nahi.");
    return;
  }

  console.log(`Contract mein "addCommitment" function call kiya ja raha hai...`);
  // addCommitment function ko call karein
  const tx = await zkpVoting.addCommitment(commitmentToRegister);

  // Transaction ke poora hone ka intezaar karein
  await tx.wait();

  console.log(`\n✅ Voter commitment safaltapoorvak register ho gaya!`);
  console.log(`Transaction Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});