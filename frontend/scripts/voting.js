



import { contractAddress, contractABI } from "./config.js"; 
import { BACKEND_URL } from "../config.js";

document.addEventListener("DOMContentLoaded", async () => {
  if (!BACKEND_URL) {
    alert("Configuration error: Backend URL missing.");
    window.location.href = "./index.html";
    return;
  }

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
});

(async () => {
  let provider, signer, contract, electionId, countdownInterval;
  let selectedCandidateIndex = null;

  const cwBtn = document.getElementById("connectWalletBtn");
  const eidDisplay = document.getElementById("electionIdDisplay");
  const eidLabel = document.getElementById("electionIdLabel");
  const topicText = document.getElementById("electionTopicText");
  const optionsCont = document.getElementById("optionsContainer");
  const submitBtn = document.getElementById("submitVoteBtn");
  const statusMsg = document.getElementById("statusMessage");
  const voteCountBox = document.getElementById("voteCountBox");
  const endTimeEl = document.getElementById("electionEndTime");
  const countdownEl = document.getElementById("countdownTimer");

  const searchForm = document.getElementById("electionSearchForm");
  const searchInput = document.getElementById("electionSearchInput");

  function getElectionIdFromURL() {
    const u = new URL(window.location.href);
    return u.searchParams.get("electionId");
  }

  function setElectionId(id) {
    electionId = id;
    eidDisplay.textContent = `ID: ${id}`;
    eidLabel.textContent = id;
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const addr = await signer.getAddress();
      cwBtn.textContent = `Connected: ${addr.slice(0, 6)}...`;
      cwBtn.disabled = true;
      contract = new ethers.Contract(contractAddress, contractABI, signer);
    } catch (e) {
      console.error("Wallet connection failed:", e);
      alert("Connection failed: " + e.message);
    }
  }

  async function loadElectionDetails() {
    if (!contract) return;
    try {
      const details = await contract.getElectionDetails(electionId);
      const startTime = details.startTime?.toNumber?.() || 0;
      const durationMinutes = details.durationMinutes?.toNumber?.() || 0;
      const isEnded = details.isEnded;

      topicText.textContent = details.name || "No topic";
      optionsCont.innerHTML = "";
      selectedCandidateIndex = null;
      submitBtn.style.display = "none";
      statusMsg.textContent = "";

      const candidates = await contract.getCandidates(electionId);
      let totalVotes = 0;

      candidates.forEach((c, idx) => {
        const btn = document.createElement("div");
        btn.className = "option-btn";
        btn.textContent = c.name;
        btn.addEventListener("click", () => {
          // ✅ FIX: Removed check on submitBtn.disabled
          document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedCandidateIndex = idx;
          submitBtn.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = `Vote "${c.name}"`;
        });
        optionsCont.appendChild(btn);
        totalVotes += c.voteCount.toNumber();
      });

      voteCountBox.textContent = totalVotes.toString().padStart(2, "0");

      const now = Math.floor(Date.now() / 1000);
      const endTime = startTime + durationMinutes * 60;

      if (isEnded || now > endTime) {
        statusMsg.textContent = "⏳ Election ended.";
        submitBtn.style.display = "none";
      } else {
        statusMsg.textContent = "🟢 Voting active. Choose a candidate.";
      }

      updateTimingUI(endTime);
    } catch (e) {
      console.error("Failed loading election:", e);
      statusMsg.textContent = "⚠️ Error loading election data.";
    }
  }

  function updateTimingUI(endTime) {
    const endTimeOnly = new Date(endTime * 1000).toLocaleTimeString();
    endTimeEl.textContent = `🕓 Ends at: ${endTimeOnly}`;

    function updateCountdown() {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTime - now;
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownEl.textContent = "✅ Election ended.";
        submitBtn.style.display = "none";
      } else {
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        countdownEl.textContent = `⏳ Time left: ${h}h ${m}m ${s}s`;
      }
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  async function handleVote() {
    if (submitBtn.disabled) {
      statusMsg.textContent = "You are not eligible to vote.";
      return;
    }
    try {
      const details = await contract.getElectionDetails(electionId);
      const startTime = details.startTime.toNumber();
      const durationMinutes = details.durationMinutes.toNumber();
      const now = Math.floor(Date.now() / 1000);
      const endTime = startTime + durationMinutes * 60;

      if (now > endTime) {
        statusMsg.textContent = "⛔ Voting time is over.";
        submitBtn.disabled = true;
        return;
      }

      const tx = await contract.vote(electionId, selectedCandidateIndex);
      await tx.wait();

      statusMsg.textContent = "✅ Voted successfully!";
      submitBtn.textContent = "Voted";
      submitBtn.disabled = true;

      await loadElectionDetails();
    } catch (e) {
      console.error("Vote failed:", e);
      const reason = e?.data?.message || e.message || "Unknown error";
      statusMsg.textContent = "❌ Vote error: " + reason;
    }
  }

  cwBtn.addEventListener("click", connectWallet);
  submitBtn.addEventListener("click", handleVote);

  searchForm.addEventListener("submit", async e => {
    e.preventDefault();
    const id = searchInput.value.trim();
    if (!id) return;
    if (!contract) {
      await connectWallet();
      if (!contract) return;
    }
    setElectionId(id);
    await loadElectionDetails();
    await updateElectionTopic(id);
    await updateElectionCriteria(id);
    await checkEligibilityAndUpdateUI(id);
  });

  const idURL = getElectionIdFromURL();
  if (idURL) {
    setElectionId(idURL);
    await connectWallet();
    await loadElectionDetails();
    await updateElectionTopic(idURL);
    await updateElectionCriteria(idURL);
    await checkEligibilityAndUpdateUI(idURL);
  }

  // document.getElementById("copyResultBtn").addEventListener("click", async () => {
  //   try {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const electionId = urlParams.get("electionId");
  //     if (!electionId) {
  //       alert("Election ID not found!");
  //       return;
  //     }
  //     const resultLink = `${window.location.origin}/result.html?electionId=${electionId}`;
  //     await navigator.clipboard.writeText(resultLink);
  //     alert("Result link copied! 📋\n" + resultLink);
  //   } catch (err) {
  //     console.error("Failed to copy: ", err);
  //     alert("Failed to copy result link.");
  //   }
  // });


document.getElementById("copyResultBtn").addEventListener("click", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const electionId = urlParams.get("electionId");
    if (!electionId) {
      alert("Election ID not found!");
      return;
    }

    const resultLink = `${window.location.origin}/result.html?electionId=${electionId}`;

    // Optional: Copy to clipboard
    await navigator.clipboard.writeText(resultLink);
    console.log("Result link copied to clipboard:", resultLink);

    // Redirect to result page
    window.location.href = resultLink;

  } catch (err) {
    console.error("Failed to process result link: ", err);
    alert("Something went wrong!");
  }
});







  async function checkEligibilityAndUpdateUI(electionId) {
    const res = await fetch(`${BACKEND_URL}/api/CheckPublicClaim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ election_id: electionId }),
    });

    const data = await res.json();

    if (!res.ok || !data.eligible) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Not Eligible to Vote";
      if (data.failedCriteria) markFailedCriteria(data.failedCriteria);
      statusMsg.textContent = "You are not eligible to vote in this election.";
    } else {
      if (!contract || !signer) {
        statusMsg.textContent = "Please connect your wallet first.";
        return;
      }

      submitBtn.disabled = false;
      submitBtn.textContent = "Select a Candidate";
      statusMsg.textContent = "You are eligible to vote!";
      markFailedCriteria([]);
    }
  }

  function markFailedCriteria(failedKeys) {
    document.querySelectorAll('.criteria-item').forEach(item => {
      const key = item.getAttribute('data-key');
      if (failedKeys.includes(key)) {
        item.classList.add('criteria-failed');
      } else {
        item.classList.remove('criteria-failed');
      }
    });
  }

  async function updateElectionTopic(electionId) {
    const topicEl = document.getElementById('electionTopicText');
    topicEl.textContent = "Loading topic...";
    try {
      const res = await fetch(`${BACKEND_URL}/api/election-criteria/${encodeURIComponent(electionId)}`);
      const data = await res.json();
      topicEl.textContent = data.topic || "Topic not found.";
    } catch (err) {
      topicEl.textContent = "Failed to load topic.";
    }
  }

  async function updateElectionCriteria(electionId) {
    const container = document.getElementById('criteriaContainer');
    container.innerHTML = '<div class="criteria-loading">Loading eligibility criteria...</div>';
    try {
      const res = await fetch(`${BACKEND_URL}/api/election-criteria/${encodeURIComponent(electionId)}/criteria`);
      const data = await res.json();
      const criteriaKeys = data.criteria || [];

      if (criteriaKeys.length === 0) {
        container.innerHTML = '<div class="criteria-empty">No eligibility criteria set for this election.</div>';
        return;
      }

      let html = '<ul class="criteria-list">';
      criteriaKeys.forEach(key => {
        html += `<li class="criteria-item" data-key="${key}">${getCriteriaSentence(key)}</li>`;
      });
      html += '</ul>';
      container.innerHTML = `<h3 class="criteria-title">Eligibility Criteria</h3>${html}`;
    } catch (err) {
      container.innerHTML = '<div class="criteria-error">Failed to load criteria.</div>';
    }
  }

  function getCriteriaSentence(key) {
    const mapping = {
      onlyIITP: "Only recipients of an IITP ID can vote.",
      account10Days: "Only users whose account is older than 10 days are eligible.",
      completedPartX: "Only users who has connected X account are eligible.",
      connectedGoogleAccount: "Only users who have connected their Google account can vote."
    };
    return mapping[key] || key;
  }

})();

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

