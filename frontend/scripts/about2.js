import { BACKEND_URL } from "../config.js";

// DOMContentLoaded to ensure DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Fallback for BACKEND_URL
  if (!BACKEND_URL) {
    console.error("BACKEND_URL is not defined. Check config.js.");
    alert("Configuration error: Backend URL missing.");
    window.location.href = './login.html';
    return;
  }

  // Token verification
  const loadingScreen = document.getElementById('loading-screen');
  try {
    const response = await fetch(`${BACKEND_URL}/api/Verify-Token`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn("Token verification failed:", response.status);
      window.location.href = './login.html';
      return;
    }

    if (loadingScreen) loadingScreen.remove();
    document.body.style.display = 'block';
    // ...existing code...
    if (loadingScreen) loadingScreen.remove();
    document.body.style.display = 'block';

    // ==== Proposal mode toggle logic START ====
    const proposalSwitch = document.getElementById('switchCheckDefault');
    const votingTopicCard = document.getElementById('voting-topic-card');
    const proposalCard = document.getElementById('proposalCard');

    function toggleProposalMode() {
      if (proposalSwitch && votingTopicCard && proposalCard) {
        if (proposalSwitch.checked) {
          votingTopicCard.style.display = 'none';
          proposalCard.style.display = '';
        } else {
          votingTopicCard.style.display = '';
          proposalCard.style.display = '';
        }
      }
    }

    if (proposalSwitch) {
      proposalSwitch.addEventListener('change', toggleProposalMode);
      // Initial state
      toggleProposalMode();
    }
    // ==== Proposal mode toggle logic END ====
  } catch (err) {
    console.error("Token verification error:", err);
    if (loadingScreen) loadingScreen.remove();
    alert("Failed to verify access. Redirecting to login...");
    window.location.href = './login.html';
    return;
  }

  // Initialize wallet check and gas price fetch
  await checkWallet();
  fetchGasPrice();
  setInterval(fetchGasPrice, 5000); // Update gas price every 5 seconds
});



const startVotingButton = document.getElementById('start-voting');

const saveCriteria = async () => {

  const criteria = {
  onlyIITP: document.getElementById('onlyIITP').checked,
  account10Days: document.getElementById('account10Days').checked,
  xAccount10Days: document.getElementById('xAccount10Days').checked,
  gmail10Days: document.getElementById('gmail10Days').checked
  };

  const topic = document.getElementById('exampleFormControlTextarea1').value;

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
        election_id: 'your-election-id', // Replace with actual election ID
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

// Add event listener for the start voting button
startVotingButton.addEventListener('click', saveCriteria);

// Fetch gas price for proposals
async function fetchGasPrice() {
  const proposeButton = document.getElementById('propose');
  if (!proposeButton) {
    console.error("Propose button not found in DOM.");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/Gwei`);
    const data = await response.json();

    if (data.status === "1" && data.message === "OK" && data.result?.ProposeGasPrice) {
      const gasPrice = parseFloat(data.result.ProposeGasPrice).toFixed(2);
      proposeButton.innerText = `🌐 Propose: ${gasPrice} Gas Fee`;
    } else {
      proposeButton.innerText = "🌐 Propose: Error!";
      console.warn("Invalid gas price response:", data);
    }
  } catch (err) {
    console.error("Gas price fetch error:", err);
inket.innerText = "🌐 Propose: API Failed!";
  }
}

// Check wallet status on load
async function checkWallet() {
  const walletAddressSpan = document.getElementById('walletAddress');
  const connectWalletButton = document.getElementById('connectWalletBtn');
  const disconnectWalletButton = document.getElementById('disconnectWalletBtn');

  if (!walletAddressSpan || !connectWalletButton || !disconnectWalletButton) {
    console.error("Wallet UI elements not found.");
    return;
  }

  if (typeof window.ethereum === 'undefined') {
    console.warn("MetaMask not detected on page load.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      const walletAddress = accounts[0];
      walletAddressSpan.textContent = `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
      connectWalletButton.classList.add('d-none');
      disconnectWalletButton.classList.remove('d-none');
    }
  } catch (err) {
    console.error("Error checking wallet on load:", err);
  }
}

// Wallet connection
async function connectWallet() {
  const walletAddressSpan = document.getElementById('walletAddress');
  const connectWalletButton = document.getElementById('connectWalletBtn');
  const disconnectWalletButton = document.getElementById('disconnectWalletBtn');

  if (!walletAddressSpan || !connectWalletButton || !disconnectWalletButton) {
    console.error("Wallet UI elements not found.");
    return;
  }

  if (typeof window.ethereum === 'undefined') {
    alert("Please install MetaMask to use this feature. Visit https://metamask.io to get started.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length > 0) {
      const walletAddress = accounts[0];

      sessionStorage.setItem('connectedWallet', walletAddress);

      walletAddressSpan.textContent = `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
      connectWalletButton.classList.add('d-none');
      disconnectWalletButton.classList.remove('d-none');
    }
  } catch (err) {
    console.error("Wallet connection failed:", err);
    alert("Failed to connect wallet. Please try again.");
  }
}

// Disconnect wallet
function disconnectWallet() {
  const walletAddressSpan = document.getElementById('walletAddress');
  const connectWalletButton = document.getElementById('connectWalletBtn');
  const disconnectWalletButton = document.getElementById('disconnectWalletBtn');

  if (!walletAddressSpan || !connectWalletButton || !disconnectWalletButton) {
    console.error("Wallet UI elements not found.");
    return;
  }

  walletAddressSpan.textContent = '';
  connectWalletButton.classList.remove('d-none');
  disconnectWalletButton.classList.add('d-none');
}

// Logout function
async function logout() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (response.ok) {
      window.location.href = './login.html';
    } else {
      console.warn("Logout failed:", response.status);
      alert("Failed to log out. Redirecting...");
      window.location.href = './login.html';
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Failed to log out. Redirecting...");
    window.location.href = './login.html';
  }
}

// Add event listeners
document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
document.getElementById('disconnectWalletBtn').addEventListener('click', disconnectWallet);
document.getElementById('logoutBtn').addEventListener('click', logout);

let timerInterval = null;
let timerSeconds = 0;
let timerInitialSeconds = 0;

function updateTimerDisplay() {
    const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const secs = String(timerSeconds % 60).padStart(2, '0');
    document.getElementById('timerValue').textContent = `${mins}:${secs}`;
}

function startTimer() {
    if (timerInterval) return; // Prevent multiple intervals
    const input = document.getElementById('timerInput');
    let mins = parseInt(input.value, 10);
    if (isNaN(mins) || mins < 1) mins = 1;
    timerSeconds = mins * 60;
    timerInitialSeconds = timerSeconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerSeconds = 0;
            updateTimerDisplay();
            // Optional: Alert or visual effect
            document.getElementById('timerValue').style.color = "#F72585";
        }
    }, 1000);
    document.getElementById('timerValue').style.color = "#183EC2";
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = timerInitialSeconds || (parseInt(document.getElementById('timerInput').value, 10) || 1) * 60;
    updateTimerDisplay();
    document.getElementById('timerValue').style.color = "#183EC2";
}

document.addEventListener('DOMContentLoaded', () => {
    updateTimerDisplay();
    document.getElementById('startTimerBtn').addEventListener('click', startTimer);
    document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
    document.getElementById('timerInput').addEventListener('input', function() {
        if (!timerInterval) {
            timerSeconds = (parseInt(this.value, 10) || 1) * 60;
            timerInitialSeconds = timerSeconds;
            updateTimerDisplay();
        }
    });
});

