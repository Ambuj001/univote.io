import { BACKEND_URL } from "../config.js";

const verifyOtpButton = document.getElementById('verify-otp-btn');
const otpInputs = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'];

otpInputs.forEach((id, index) => {
  const current = document.getElementById(id);
  const next = otpInputs[index + 1];
  const prev = otpInputs[index - 1];

  current.addEventListener('input', () => {
    current.value = current.value.replace(/[^0-9]/g, ''); // Restrict to digits
    if (current.value.length === 1 && next) {
      document.getElementById(next).focus();
    }
  });

  // Go to previous input on Backspace if current is empty
  current.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && current.value === '' && prev) {
      document.getElementById(prev).focus();
    }
  });
});

const verifyOtp = async function verifyOTP() {
  const otp = otpInputs
    .map(id => document.getElementById(id).value)
    .join('');

  const messageDiv = document.getElementById('message');
  messageDiv.style.color = 'green';
  messageDiv.innerText = 'Verifying OTP...';

  try {
    const response = await fetch(`${BACKEND_URL}/api/VerifyOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ otp })
    });

    const data = await response.json();

    if (!response.ok) {
      messageDiv.style.color = 'red';
      if (data?.errors?.length > 0) {
        messageDiv.innerText = data.errors[0].msg;
      } else {
        messageDiv.innerText = 'Something went wrong. Please try again.';
      }
      return;
    }

    // OTP verified successfully
    messageDiv.style.color = 'green';
    messageDiv.innerText = data.message || 'OTP verified successfully!';
    
    setTimeout(() => {
      window.location.href = './governance.html';
    }, 1000);
  } catch (error) {
    console.error('Error:', error);
    messageDiv.style.color = 'red';
    messageDiv.innerText = 'Server error. Please try again later.';
  }
};

verifyOtpButton.addEventListener('click', verifyOtp);

// Resend OTP functionality
const resendButton = document.getElementById('resend-otp-btn');
const resendTimer = document.getElementById('resend-timer');
let cooldown = 0;

function startCooldown() {
  cooldown = 30; // 30-second cooldown
  resendButton.disabled = true;
  resendTimer.textContent = `Resend available in ${cooldown} seconds`;

  const timer = setInterval(() => {
    cooldown--;
    resendTimer.textContent = `Resend available in ${cooldown} seconds`;
    if (cooldown <= 0) {
      clearInterval(timer);
      resendButton.disabled = false;
      resendTimer.textContent = '';
    }
  }, 1000);
}

resendButton.addEventListener('click', async () => {
  const messageDiv = document.getElementById('message');
  messageDiv.style.color = 'green';
  messageDiv.innerText = 'Requesting new OTP...';

  try {
    const response = await fetch(`${BACKEND_URL}/api/ResendOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      messageDiv.style.color = 'red';
      if (data?.errors?.length > 0) {
        messageDiv.innerText = data.errors[0].msg;
      } else {
        messageDiv.innerText = 'Failed to resend OTP. Please try again.';
      }
      return;
    }

    // OTP resent successfully
    messageDiv.style.color = 'green';
    messageDiv.innerText = data.message || 'New OTP sent!';
    
    // Clear input fields and focus on the first
    otpInputs.forEach(id => (document.getElementById(id).value = ''));
    document.getElementById('otp1').focus();
    
    // Start cooldown
    startCooldown();
  } catch (error) {
    console.error(`Error: ${error}`);
    messageDiv.style.color = 'red';
    messageDiv.innerText = 'Server error. Please try again later.';
  }
});