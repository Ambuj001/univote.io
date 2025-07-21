 // const circomlib = require('circomlibjs'); // Make sure you use circomlibjs for Poseidon
// const crypto = require('crypto');
// let poseidonInstance;
// (async () => {
//   poseidonInstance = await circomlib.buildPoseidon();
// })();

// const Voters = require('../../models/voter');
// const ElectionCriteria = require('../../models/election_criteria');

// // === Generate the secret ===
// const secret = '0x' + crypto.randomBytes(32).toString('hex');

// function sha256ToBigInt(data) {
//   const hash = crypto.createHash('sha256').update(data).digest('hex');
//   return BigInt('0x' + hash);
// }

// function generatePublicRegisteredCommitment(userId, electionId) {
//   if (!poseidonInstance) throw new Error("Poseidon not initialized yet");
//   const hashOutput = poseidonInstance([BigInt(secret)]);
//   const commitment = poseidonInstance.F.toString(hashOutput);
//   return { commitment };
// }

// exports.checkPublicClaim = async (req, res) => {
//   try {
//     const { email } = req.user;
//     const { election_id } = req.body;
//     const voter = await Voters.findOne({ email });
//     if (!voter) {
//       return res.status(404).json({ message: 'Voter not found' });
//     }

//     const electionCriteria = await ElectionCriteria.findOne({ election_id });
//     if (!electionCriteria) {
//       return res.status(404).json({ message: 'Election criteria not found' });
//     }

//     const criteria = electionCriteria.criteria instanceof Map
//       ? Object.fromEntries(electionCriteria.criteria)
//       : electionCriteria.criteria;

//     let failedCriteria = [];

//     // Example checks (expand as needed)
//     if (criteria.onlyIITP && !(voter.email && voter.email.endsWith("@iitp.ac.in"))) {
//       failedCriteria.push('onlyIITP');
//     }
//     if (criteria.account10Days) {
//       const accountCreatedAt = new Date(voter.createdAt);
//       const accountAgeInDays = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
//       if (accountAgeInDays < 10) failedCriteria.push('account10Days');
//     }
//     if (criteria.completedPartX && !voter.completedPartX) {
//       failedCriteria.push('completedPartX');
//     }
//     if (criteria.connectedGoogleAccount && !voter.googleConnected) {
//       failedCriteria.push('connectedGoogleAccount');
//     }

//     if (failedCriteria.length > 0) {
//       return res.status(403).json({
//         eligible: false,
//         failedCriteria
//       });
//     }

//     // All criteria passed

//     const { commitment, components } = generatePublicRegisteredCommitment(email, election_id, secret);

//     return res.status(200).json({
//       eligible: true,
//       publicRegisteredCommitment: commitment,
//       secret, // ⚠️ Remove in production
//       debug_components: components // ⚠️ Remove in production
//     });
//   }
//   catch (error) {
//     console.error('Error checking public claim:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };


 






//  const { ethers } = require("ethers"); // Ethers library ko import karein
// const circomlib = require('circomlibjs');
// const crypto = require('crypto');

// // Mongoose Models ko import karein
// const Voters = require('../../models/voter');
// const ElectionCriteria = require('../../models/election_criteria');

// // Poseidon instance ko yahan sirf declare karein.
// let poseidonInstance;

// // =================================================================
// // ===== HELPER FUNCTIONS (Bilkul addVoter.js jaise) =====
// // =================================================================

// /**
//  * Har user ke liye ek unique aur constant secret generate karta hai.
//  */
// function generateUserSecret(userId) {
//     const masterSecret = process.env.VOTER_MASTER_SECRET;
//     if (!masterSecret) {
//         throw new Error("VOTER_MASTER_SECRET environment variable not set!");
//     }
//     const hash = crypto.createHmac('sha256', masterSecret)
//                        .update(userId)
//                        .digest('hex');
//     return '0x' + hash;
// }

// /**
//  * User ke secret se uska commitment sahi bytes32 format mein banata hai.
//  */
// function generateCommitmentFromSecret(userSecret) {
//     if (!poseidonInstance) throw new Error("Poseidon has not been initialized");
    
//     // poseidon ka output ek Uint8Array hota hai.
//     const hashOutput = poseidonInstance([BigInt(userSecret)]);
    
//     // Ethers ka istemaal karke Uint8Array ko sahi hex string mein badlein
//     const hexHash = ethers.hexlify(hashOutput);

//     // Ab is hex string ko 32 bytes me pad karein
//     const paddedCommitment = ethers.zeroPadValue(hexHash, 32);

//     return paddedCommitment;
// }

// // =================================================================
// // ===== POORA AUR SAHI `checkPublicClaim` FUNCTION =====
// // =================================================================

// exports.checkPublicClaim = async (req, res) => {
//     try {
//         // Race condition se bachne ke liye Poseidon ko yahan initialize karein
//         if (!poseidonInstance) {
//             poseidonInstance = await circomlib.buildPoseidon();
//             console.log("Poseidon instance initialized on first API request.");
//         }

//         const { email } = req.user;
//         const { election_id } = req.body;

//         if (!election_id) {
//             return res.status(400).json({ message: 'Election ID is required' });
//         }
        
//         const voter = await Voters.findOne({ email });
//         if (!voter) {
//             return res.status(200).json({ eligible: false, failedCriteria: ['VoterNotFound'] });
//         }

//         const electionCriteria = await ElectionCriteria.findOne({ election_id });
//         // Agar election ke liye koi criteria set nahi hai, to sab eligible hain.
//         if (!electionCriteria || !electionCriteria.criteria || electionCriteria.criteria.size === 0) {
//             // User ko eligible maankar commitment generate karein
//             const userSecret = generateUserSecret(email);
//             const commitment = generateCommitmentFromSecret(userSecret);
//             return res.status(200).json({
//                 eligible: true,
//                 publicRegisteredCommitment: commitment,
//                 secret: userSecret,
//             });
//         }
        
//         const criteria = electionCriteria.criteria;
//         const failedCriteria = [];

//         // Eligibility checks
//         if (criteria.get('onlyIITP') && !(voter.email && voter.email.endsWith("@iitp.ac.in"))) {
//             failedCriteria.push('onlyIITP');
//         }
//         if (criteria.get('account10Days')) {
//             const accountCreatedAt = new Date(voter.createdAt);
//             const accountAgeInDays = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
//             if (accountAgeInDays < 10) {
//                 failedCriteria.push('account10Days');
//             }
//         }
//         // ...baaki saare criteria checks...


//         if (failedCriteria.length > 0) {
//             return res.status(200).json({
//                 eligible: false,
//                 failedCriteria
//             });
//         }

//         // Agar user sabhi criteria pass kar leta hai
//         const userSecret = generateUserSecret(email);
//         const commitment = generateCommitmentFromSecret(userSecret);

//         return res.status(200).json({
//             eligible: true,
//             publicRegisteredCommitment: commitment,
//             secret: userSecret,
//         });

//     } catch (error) {
//         console.error('Error checking public claim:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };






 
// # VOTER_MASTER_SECRET=some-very-secret-key



//  SEPOLIA_RPC_URL= https://sepolia.base.org
//  PRIVATE_KEY="b4eb632a6704896fe7badd7ea357eec389ddae352a7572e9290efab39f59278c"
//  CONTRACT_ADDRESS=0x3922877F1697B0449A51B682620F26bFB325Fa14  
// MONGODB_URI_PRODUCTION=mongodb+srv://sikdara477:omikun@cluster0.qyjcazl.mongodb.net/voters
// MONGODB_URI_TESTING=mongodb+srv://sikdara477:omikun@cluster0.qyjcazl.mongodb.net/voters_testing
// NODE_ENV=development  # or "production" when on Render
// SECRET_KEY=univote  # Replace with your actual secret key
// EMAIL=univote.tech@gmail.com
// EMAIL_PASS=hjzwyhefqjubxueu
// GOOGLE_CLIENT_ID=537966024039-fm932ftvjcdc8v7dqmd7g0lnr1pi5och.apps.googleusercontent.com
//  VOTER_MASTER_SECRET="MySuperSecretKeyForGeneratingVoterSecrets123!@#$%"