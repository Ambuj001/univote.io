import { BACKEND_URL } from "../config.js";

window.openEmailModal = openEmailModal;
window.closeModal = closeModal;
window.sendCodeToEmail = sendCodeToEmail;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;

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
});

function updateUsername() {
    const showUsername = document.getElementById('span-username');
    const gmailStatus = document.getElementById('gmail-status');
    const iitpStatus = document.getElementById('iitp-status');
    const telegramStatus = document.getElementById('telegram-status');
    const xStatus = document.getElementById('x-status');

    try {
        fetch(`${BACKEND_URL}/api/Username`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch username');
            }
        })
        .then(data => {
            if (data.username) {
                showUsername.innerText = data.username;
                showUsername.style.display = 'inline-block'; // Ensure username is visible
            } else {
                showUsername.innerText = '';
                showUsername.style.display = 'none';
            }
            if (data.linkedAccounts) {
              gmailStatus.innerText = data.linkedAccounts.google
                ? `Gmail account linked: ${data.linkedAccounts.google}`
                : "Link your gmail account here";
              iitpStatus.innerText = data.linkedAccounts.iitp
                ? `IIT-P Email linked: ${data.linkedAccounts.iitp}`
                : "Link your IIT-P Email here";
              xStatus.innerText = data.linkedAccounts.x
                ? `X account linked: ${data.linkedAccounts.x}`
                : "Link your X account here";
              // If you add Telegram to your schema, update here as well
              telegramStatus.innerText = data.linkedAccounts.telegram
                ? `Telegram account linked: ${data.linkedAccounts.telegram}`
                : "Link your Telegram account here";
            } else {
              // Default text if linkedAccounts not present
              gmailStatus.innerText = "Link your gmail account here";
              iitpStatus.innerText = "Link your IIT-P Email here";
              xStatus.innerText = "Link your X account here";
              telegramStatus.innerText = "Link your Telegram account here";
            }
        })
        .catch(error => {
            console.error('Error fetching username:', error);
            gmailStatus.innerText = "Link your gmail account here";
            iitpStatus.innerText = "Link your IIT-P Email i'd here";
            xStatus.innerText = "Link your X account here";
            telegramStatus.innerText = "Link your Telegram account here";
        });
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
    }
};

document.addEventListener('DOMContentLoaded', updateUsername);

// Run when page is shown from bfcache or normal navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        updateUsername();
    }
});

function loadWalletFromSession() {
  const profileWalletAddressSpan = document.getElementById('profile-wallet-address');
  const walletAddress = sessionStorage.getItem('connectedWallet');
  if (walletAddress && profileWalletAddressSpan) {
    const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    profileWalletAddressSpan.textContent = shortAddress;
  }
}

document.addEventListener('DOMContentLoaded', loadWalletFromSession);
// Run when page is shown from bfcache or normal navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        loadWalletFromSession();
    }
});

let currentAccountType = '';

function openEmailModal(accountType) {
  currentAccountType = accountType;
  document.getElementById('emailModal').style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

async function sendCodeToEmail() {
  const email = document.getElementById('userEmail').value;
  if (!email) {
    alert('Please enter your email.');
    return;
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/accounts/send-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        type: currentAccountType,
        email: email
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Success: show OTP modal
      closeModal('emailModal');
      document.getElementById('otpModal').style.display = 'block';
      alert(data.message || 'OTP sent to your email.');
    } else {
      // Error: show error message
      alert(data.error || 'Failed to send OTP.');
    }
  } catch (error) {
    alert('An error occurred while sending the code.');
    console.error('Error sending code:', error);
  }
}
async function verifyOTP() {
  const email = document.getElementById('userEmail').value; // Use the same email entered earlier
  const otp = document.getElementById('userOTP').value;

  if (!email) {
    alert('Email is missing. Please re-enter your email.');
    return;
  }
  if (!otp) {
    alert('Please enter the OTP.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/accounts/verify-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
        type: currentAccountType // Pass the account type
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || 'OTP verified successfully!');
      closeModal('otpModal');
      await updateUsername(); // Refresh the username and linked accounts
      // Optionally, update UI to show account is linked
    } else {
      alert(data.error || 'Failed to verify OTP.');
    }
  } catch (error) {
    alert('An error occurred while verifying the OTP.');
    console.error('Error verifying OTP:', error);
  }
}


function resendOTP() {
  // TODO: Resend OTP via backend API
  alert('OTP resent!');
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

