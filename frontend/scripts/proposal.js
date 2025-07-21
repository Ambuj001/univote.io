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


async function fetchGasPrice() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/Gwei`);
    const data = await response.json();

    if (data.status === "1" && data.message === "OK") {
      propose.innerText = ` ${data.result.ProposeGasPrice} Gas Fee`;
    } else {
      propose.innerText = "Error!";
    }
  } catch (err) {
    propose.innerText = "API Failed!";
  }
}

fetchGasPrice();
setInterval(fetchGasPrice, 5000);

document.getElementById("checkBtn").addEventListener("click", function () {
    const hash = document.getElementById("txnHashInput").value.trim();
    
    // Optional: Basic validation to check if it's a valid transaction hash
    if (hash && /^0x([A-Fa-f0-9]{64})$/.test(hash)) {
      const url = `https://basescan.org/tx/${hash}`;
      window.open(url, '_blank'); // Opens in a new tab
    } else {
      alert("Please enter a valid transaction hash (starting with 0x and 66 characters long).");
    }
  });
