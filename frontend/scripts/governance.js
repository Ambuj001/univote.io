




import { BACKEND_URL } from "../config.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Config check
    if (!BACKEND_URL) {
        alert("Configuration error: Backend URL missing.");
        window.location.href = "./index.html";
        return;
    }

    // Verify token
    try {
        const response = await fetch(`${BACKEND_URL}/api/Verify-Token`, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) throw new Error();
        document.documentElement.style.visibility = "visible";
    } catch {
        alert("Access denied. Redirecting to login...");
        window.location.href = "./index.html";
    }

    init();
});

// ========== Contract Config ==========
const contractAddress = "0x5ac18C2b545795e4573CCD75EEC2375939502b83";
const contractABI = [{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "length",
            "type": "uint256"
        }
    ],
    "name": "StringsInsufficientHexLength",
    "type": "error"
},
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
        }
    ],
    "name": "CandidateAdded",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "creator",
            "type": "address"
        }
    ],
    "name": "ElectionCreated",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        }
    ],
    "name": "ElectionEnded",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "address",
            "name": "voter",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "candidateIndex",
            "type": "uint256"
        }
    ],
    "name": "Voted",
    "type": "event"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        },
        {
            "internalType": "string",
            "name": "name",
            "type": "string"
        }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "name",
            "type": "string"
        },
        {
            "internalType": "uint256",
            "name": "durationInMinutes",
            "type": "uint256"
        }
    ],
    "name": "createElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "",
            "type": "string"
        }
    ],
    "name": "electionExists",
    "outputs": [
        {
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "name": "electionIds",
    "outputs": [
        {
            "internalType": "string",
            "name": "",
            "type": "string"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        }
    ],
    "name": "endElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [],
    "name": "getAllElectionIds",
    "outputs": [
        {
            "internalType": "string[]",
            "name": "",
            "type": "string[]"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        }
    ],
    "name": "getCandidates",
    "outputs": [
        {
            "components": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "voteCount",
                    "type": "uint256"
                }
            ],
            "internalType": "struct UniVote.Candidate[]",
            "name": "",
            "type": "tuple[]"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        }
    ],
    "name": "getElectionDetails",
    "outputs": [
        {
            "internalType": "string",
            "name": "id",
            "type": "string"
        },
        {
            "internalType": "string",
            "name": "name",
            "type": "string"
        },
        {
            "internalType": "address",
            "name": "creator",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "durationMinutes",
            "type": "uint256"
        },
        {
            "internalType": "bool",
            "name": "isEnded",
            "type": "bool"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        }
    ],
    "name": "getResults",
    "outputs": [
        {
            "components": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "voteCount",
                    "type": "uint256"
                }
            ],
            "internalType": "struct UniVote.Candidate[]",
            "name": "",
            "type": "tuple[]"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [],
    "name": "totalElections",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "string",
            "name": "electionId",
            "type": "string"
        },
        {
            "internalType": "uint256",
            "name": "candidateIndex",
            "type": "uint256"
        }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}];

let provider, signer, contract;
let currentElectionId = null;
let lastTxHash = null;

// ========== DOM Elements ==========
const connectWalletBtn = document.getElementById("connectWalletBtn");
const startVotingBtn = document.getElementById("startVotingBtn");
const endVotingBtn = document.getElementById("endVotingBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const addCandidateBtn = document.getElementById("addCandidateBtn");
const electionIdDisplay = document.getElementById("electionIdDisplay");
const voteCountDisplay = document.getElementById("voteCount");
const timerDisplay = document.getElementById("timer");
const timerCircle = document.querySelector(".timer-circle");
 const voteCountBox = document.getElementById("voteCountBox");

function init() {
    connectWalletBtn.addEventListener("click", connectWallet);
    startVotingBtn.addEventListener("click", startElection);
    endVotingBtn.addEventListener("click", endElection);
    copyLinkBtn.addEventListener("click", copyVotingLink);
    addCandidateBtn.addEventListener("click", addCandidate);
    addCandidate();
    addCandidate();
}

async function connectWallet() {
    if (typeof window.ethereum === "undefined") return alert("MetaMask not installed");
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        const address = await signer.getAddress();
        connectWalletBtn.textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
        connectWalletBtn.disabled = true;
        startVotingBtn.disabled = false;
    } catch (err) {
        console.error(err);
        alert("Wallet connection failed.");
    }
}

async function startElection() {
    resetStepper();

    const topic = document.getElementById("votingTopic").value;
    const duration = document.getElementById("timerInput").value;
    const candidates = Array.from(document.querySelectorAll(".candidate-input"))
        .map((el) => el.value)
        .filter((v) => v.trim() !== "");

    if (!topic || !duration || candidates.length < 2) return alert("Fill topic, duration & at least 2 candidates");

    updateStep(1, null, Date.now());

    try {
        const tx = await contract.createElection(topic, duration);
        updateStep(2, null, Date.now());
        updateStep(3, null, Date.now());
        await tx.wait();

        updateStep(4, null, Date.now());

        const allIds = await contract.getAllElectionIds();
        currentElectionId = allIds[allIds.length - 1];
        electionIdDisplay.textContent = currentElectionId;

        for (let name of candidates) {
            const txAdd = await contract.addCandidate(currentElectionId, name);
            await txAdd.wait();
        }

        saveCriteria(currentElectionId);

        alert("Election created!");
        copyLinkBtn.disabled = false;
    } catch (err) {
        console.error(err);
        alert("Failed to create election.");
    }
}

async function endElection() {
    if (!contract || !currentElectionId) return alert("No election selected.");
    try {
        const tx = await contract.endElection(currentElectionId);
        await tx.wait();
        alert("Election ended.");
        await showResults();
    } catch (err) {
        console.error(err);
        alert("Failed to end election.");
    }
}

async function showResults() {
    if (!contract || !currentElectionId) return;
    try {
        const results = await contract.getResults(currentElectionId);
        const labels = results.map((r) => r.name);
        const data = results.map((r) => r.voteCount.toNumber());
        initializeChart(labels, data);
        updateResultList(labels, data);
        voteCountDisplay.textContent = data.reduce((a, b) => a + b, 0);
    } catch (err) {
        console.error(err);
        alert("Error fetching results.");
    }
}

function addCandidate() {
    const container = document.getElementById("candidates");
    const input = document.createElement("input");
    input.className = "candidate-input";
    input.placeholder = `option ${container.children.length + 1}`;
    container.appendChild(input);
}

function initializeChart(labels = [], data = []) {
    const ctx = document.getElementById("resultChart").getContext("2d");
    const backgroundColors = ["#4ade80", "#f87171", "#38bdf8", "#fbbf24"];
    if (window.resultChart) window.resultChart.destroy();
    window.resultChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels.length > 0 ? labels : ["No data"],
            datasets: [
                {
                    data: data.length > 0 ? data : [1],
                    backgroundColor: data.length > 0 ? backgroundColors.slice(0, data.length) : ["#e5e7eb"],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            cutout: "70%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: data.length > 0 },
            },
            responsive: true,
        },
    });
}

function updateResultList(labels, data) {
    const list = document.getElementById("resultList");
    list.innerHTML = "";
    const totalVotes = data.reduce((sum, current) => sum + current, 0);
    if (totalVotes === 0) {
        list.innerHTML = "<li>No votes cast yet.</li>";
        return;
    }
    labels.forEach((label, index) => {
        const percentage = totalVotes > 0 ? ((data[index] / totalVotes) * 100).toFixed(1) : 0;
        const li = document.createElement("li");
        li.textContent = `${percentage}% ${label} (${data[index]} votes)`;
        list.appendChild(li);
    });
}

function copyText(text) {
    if (!text || text === '0xTxHash123...') return alert("Nothing to copy yet.");
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!")).catch(err =>{
        alert("Failed to copy text.");
        console.error('Clipboard copy failed', err);
    });
}


function getVotingPagePath() {
    // On localhost (any port), use /frontend/vote.html
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    ) {
        return '/frontend/vote.html';
    } else {
        return '/vote.html';
    }
}

function copyVotingLink() {
    if (!currentElectionId) return alert("No election ID available to generate a link.");
    const voteUrl = `${window.location.origin}${getVotingPagePath()}?electionId=${currentElectionId}`;
    copyText(voteUrl);
}

function updateStep(stepNum, status, timestamp = null) {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        step.classList.remove("active", "completed");
        if (i < stepNum) step.classList.add("completed");
        if (i === stepNum) step.classList.add("active");
    }
    if (stepNum === 4) {
        const step = document.getElementById("step-4");
        step.classList.add("completed");
    }
    if (timestamp) {
        document.getElementById(`ts-${stepNum}`).textContent = new Date(timestamp).toLocaleTimeString();
    }
}

function resetStepper() {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        step.classList.remove("active", "completed");
        document.getElementById(`ts-${i}`).textContent = "";
    }
}

const saveCriteria = async (yourElectionId) => {

    const criteria = {
        onlyIITP: document.getElementById('onlyIITP').checked,
        account10Days: document.getElementById('account10Days').checked,
        completedPartX: document.getElementById('completedPartX').checked,
        connectedGoogleAccount: document.getElementById('connectedGoogleAccount').checked
    };

    const topic = document.getElementById('votingTopic').value;

    if (!topic.trim()) {
        alert("Please enter a voting topic.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/Save-Election-Criteria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                election_id: yourElectionId, // Replace with actual election ID
                criteria: criteria,
                topic: topic
            })
        });
        const data = await response.json();
        // handle success (e.g., show a confirmation message)
        if (data.status === "1") {
            console.log("Criteria set successfully:", data);
        } else {
            console.warn("Failed to set criteria:", data.message);
        }
    } catch (error) {
        console.error("Error setting criteria:", error);
        alert("Failed to set election criteria. Please try again.");
    }
};


async function getElectionEndTime(electionId) {
    if (!window.ethereum) throw new Error("MetaMask not detected");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const details = await contract.getElectionDetails(electionId);
    const startTime = parseInt(details.startTime.toString());
    const duration = parseInt(details.durationMinutes.toString()) * 60;

    return startTime + duration; // election ka end time
}

const gweiVersionSpan = document.querySelector('.gwei-indicator .version');

async function updateGwei() {
    try {
        // Adjust the endpoint as per your backend route
        const response = await fetch(`${BACKEND_URL}/api/Gwei`);
        if (!response.ok) {
            throw new Error('Failed to fetch gwei');
        }
        const data = await response.json();
        // Etherscan's API returns the value as a string, e.g., data.result.ProposeGasPrice
        let gwei = data.result?.SafeGasPrice;
        if (gwei && !isNaN(gwei)) {
            gwei = parseFloat(gwei).toFixed(2);
        } else {
            gwei = 'N/A';
        }
        gweiVersionSpan.textContent = gwei;
    } catch (err) {
        console.error('Error updating gwei:', err);
        gweiVersionSpan.textContent = 'N/A';
    }
}

// Initial fetch
updateGwei();

// Update every 5 seconds (5000 ms)
setInterval(updateGwei, 5000);

      voteCountBox.textContent = totalVotes.toString().padStart(2, "0");
