

pragma circom 2.0.0;

include "./poseidonHasher.circom";   // <-- agar tera file me yeh sahi path ho

/*
 * @title ZKAttestedClaimLogin
 * @author Ambuj (UNI-VOTE Team)
 * @notice This circuit proves that a user knows a private secret corresponding
 * to a public commitment and generates a unique nullifier for a specific claim.
 * This prevents double-actions (like double-voting) while preserving user privacy.
 */
template ZKAttestedClaimLogin() {

    // === PRIVATE INPUTS ===
    // These are secret values known only to the user generating the proof.
    signal input userSecret_private;

    // === PUBLIC INPUTS ===
    // These values are known by both the prover and the verifier (the smart contract).
    signal input publicClaim;                  // A public identifier for the action (e.g., an election ID).
    signal input publicAttestationNonce;       // A nonce from the backend, attesting to the validity of the claim.
                                               // Note: While this is a public input, we are not constraining it in this version
                                               // of the circuit, but it's essential for the verifier contract logic.
    signal input publicRegisteredCommitment;   // The user's commitment (hash of their secret), stored on-chain.


    // === PUBLIC OUTPUTS ===
    // These are the results of the circuit's computation, which are also public.
    signal output nullifierHash; // The unique nullifier to be stored on-chain to prevent replay attacks.


    // === HASHING COMPONENTS ===
    // We instantiate two Poseidon hashers.
    // Hasher for the commitment check (1 input).
    component commitmentHasher = Poseidon(1);
    // Hasher for the nullifier (2 inputs).
    component nullifierHasher = Poseidon(2);


    // === CONSTRAINTS ===
    // The core logic of the ZK proof. The proof is only valid if all constraints are met.

    // Constraint 1: Prove knowledge of the secret corresponding to the public commitment.
    // We hash the private user secret inside the circuit.
    commitmentHasher.inputs[0] <== userSecret_private;

    // We then enforce that the result of this hash MUST equal the public commitment
    // that was registered on the blockchain. This proves ownership.
    publicRegisteredCommitment === commitmentHasher.out;


    // Constraint 2: Calculate and output the nullifier.
    // The nullifier is a hash of the user's private secret and the public claim.
    // This ensures that for any given claim (e.g., Election A), the user can only
    // generate ONE valid nullifier.
    nullifierHasher.inputs[0] <== userSecret_private;
    nullifierHasher.inputs[1] <== publicClaim;

    // Assign the output of the hasher to the public output signal.
    nullifierHash <== nullifierHasher.out;
}

// Instantiate the main component for compilation.
component main {public [publicClaim, publicAttestationNonce, publicRegisteredCommitment]} = ZKAttestedClaimLogin();