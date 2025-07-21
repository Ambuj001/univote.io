// poseidonHasher.circom
pragma circom 2.0.0;

// This file directly imports the Poseidon hash function implementation from circomlib.
// Make sure you have circomlib installed:
// From your project's root folder (Univoite ZKP), run:
// npm install circomlib

// IMPORTANT: The path below assumes that circomlib is installed in node_modules
// directly inside the 'zkp' folder.
// Current file path: C:\Users\ujjaw\OneDrive\Desktop\univote zkp\zkp\circuits\poseidonHasher.circom
// To reach node_modules from here: ../ (from circuits to zkp), then node_modules/...
include "../node_modules/circomlib/circuits/poseidon.circom";

// DO NOT define template Poseidon(n) here again.
// circomlib/circuits/poseidon.circom already defines it.
// Your ZKAttestedClaimLogin.circom can now directly use Poseidon(1) and Poseidon(2)
// which will refer to the template defined in circomlib.