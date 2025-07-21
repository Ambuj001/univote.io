import { BACKEND_URL } from "../config.js"; 

window.addEventListener('DOMContentLoaded', async () => {
  // Wait for config.js to set BACKEND_URL
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const response = await fetch(`${BACKEND_URL}/api/Verify-Token`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      window.location.href = './login.html';
      return;
    }

    document.getElementById('loading-screen')?.remove();
    document.body.style.display = 'block';
  } catch (err) {
    console.error("Token verification error:", err);
    window.location.href = './login.html';
  }
});

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

