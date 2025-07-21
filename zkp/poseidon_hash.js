const circomlib = require('circomlibjs');
const { buildPoseidon } = circomlib;

(async () => {
    const poseidon = await buildPoseidon();
    const secret = BigInt(7);
    const hash = poseidon([secret]);
    const hashHex = poseidon.F.toString(hash);
    console.log("Poseidon Hash:", hashHex);
})();
