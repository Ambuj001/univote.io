import { BACKEND_URL } from "../config.js";

const launchButton = document.getElementById("launch-app-btn");

const launchapp = async function launchApp() {
  try{
    const response = await fetch (`${BACKEND_URL}/api/Authenticate`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
    });
    if (response.ok) {
      window.location.href = './governance.html';
    } else {
      openModal();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.getElementById("signinBtn").addEventListener("click", async function(e) {
  e.preventDefault();

  document.getElementById('loadingMessage').style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = { email, password };

  try{
    const response = await fetch(`${BACKEND_URL}/api/SignIn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    document.getElementById('loadingMessage').style.display = 'none';

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.message);

      // Show success message
      document.getElementById('successMessage').style.display = 'block';

      // Redirect after short delay
      setTimeout(() => {
          window.location.href = './governance.html';
      }, 1000); // 1 seconds delay
    }
    else {
      const data = await response.json();
      const errors = data.errors || [];

      ['email', 'password'].forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) errorElement.textContent = '';
      });

      errors.forEach(err => {
        const field = err.param || err.path;
        const message = err.msg;
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = message;

        } else if (field === 'form') {
            const formError = document.getElementById('formError');
            if (formError) formError.textContent = message;

        } else {
            console.error(`${field}: ${message}`);
        }
      });
      console.log(data.errors); // Show them as alerts or in the DOM
    }
  } catch (error) {
    console.error('Error:', error);
    document.open();
    console.error('Error:', error);
    document.close();
  }
});


function updateUsername() {
    const showUsername = document.getElementById('navbar-username');
    const loginButton = document.getElementById('login-btn');

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
                loginButton.style.display = 'none'; // Hide login button
            } else {
                showUsername.innerText = '';
                showUsername.style.display = 'none';
                loginButton.style.display = 'inline-block';
            }
        })
        .catch(error => {
            console.error('Error fetching username:', error);
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

launchButton.addEventListener("click", launchapp);

const GoogleSignIn = async () => {
  document.getElementById('loadingMessage').style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';

  // Initialize Google Identity Services
  google.accounts.id.initialize({
    client_id: '537966024039-fm932ftvjcdc8v7dqmd7g0lnr1pi5och.apps.googleusercontent.com', // Replace with your actual client ID
    callback: handleCredentialResponse,
  });

  google.accounts.id.prompt(); // Show the Google sign-in popup
};

async function handleCredentialResponse(response) {
  // response.credential contains the Google ID token
  const idToken = response.credential;

  try {
    const res = await fetch(`${BACKEND_URL}/api/SignIn/Google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token: idToken }),
    });

    document.getElementById('loadingMessage').style.display = 'none';

    if (res.ok) {
      const data = await res.json();
      console.log('Success:', data.message || 'Signed in with Google');

      // Show success message
      document.getElementById('successMessage').style.display = 'block';

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = './governance.html';
      }, 1000);
    } else {
      const data = await res.json();
      const errors = data.errors || [];

      // Clear previous errors
      ['email', 'password'].forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) errorElement.textContent = '';
      });

      // Display any errors (e.g., from backend validation)
      errors.forEach(err => {
        const field = err.param || err.path;
        const message = err.msg;
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
          errorElement.style.display = 'block';
          errorElement.textContent = message;
        } else if (field === 'form') {
          const formError = document.getElementById('formError');
          if (formError) formError.textContent = message;
        } else {
          console.error(`${field}: ${message}`);
        }
      });
      console.log(data.errors);
    }
  } catch (error) {
    console.error('Error:', error);
    document.open();
    document.close();
  }
}

document.getElementById("g_id_signin").addEventListener("click", GoogleSignIn);
document.getElementById("g_id_signup").addEventListener("click", GoogleSignIn);

document.getElementById('signUpBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    document.getElementById('signuploadingMessage').style.display = 'block';
    document.getElementById('signupsuccessMessage').style.display = 'none';
    
    const formData = {
        email: document.getElementById('emailId').value,
        password: document.getElementById('signup-password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/SendOtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        document.getElementById('loadingMessage').style.display = 'none';

        if (!response.ok) {
          const data = await response.json();
          const errors = data.errors || [];

          // Clear all previous errors
          ['signupemail', 'signuppassword', 'confirmPassword'].forEach(field => {
              const errorElement = document.getElementById(`${field}Error`);
              if (errorElement) {
                  errorElement.textContent = '';
                  errorElement.style.display = 'none';
              }
          });
          
          const errorFieldMap = {
            email: 'signupemailError',
            password: 'signuppasswordError',
            confirmPassword: 'confirmPasswordError',
            username: 'signupformError', // or create a specific username error element
            form: 'signupformError'
          };

          errors.forEach(err => {
            const field = err.param || err.path;
            const message = err.msg;
            const errorElementId = errorFieldMap[field];
            const errorElement = errorElementId ? document.getElementById(errorElementId) : null;
            if (errorElement) {
              errorElement.style.display = 'block';
              errorElement.textContent = message;
            } else {
              console.error(`${field}: ${message}`);
            }
          });

        } else {
            const data = await response.json();
            console.log('Success:', data.message);

            // Show success message
            document.getElementById('signupsuccessMessage').style.display = 'block';

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = './otp.html';
            }, 1000); // 1 second delay
        }            
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('signuploadingMessage').style.display = 'none';
        const formError = document.getElementById('signupformError');
        if (formError) {
            formError.textContent = 'An error occurred. Please try again.';
            formError.style.display = 'block';
        }
    }
});

// faq script
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');
  const answers = document.querySelectorAll('.answer');

  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      faqItems.forEach(i => i.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');

      // Hide all answers
      answers.forEach(answer => answer.style.display = 'none');

      // Show the corresponding answer
      const targetId = item.getAttribute('data-target');
      const targetAnswer = document.getElementById(targetId);
      if (targetAnswer) {
        targetAnswer.style.display = 'block';
      }
    });
  });

  // Show the first answer by default
  if (faqItems.length > 0) {
    faqItems[0].click();
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

