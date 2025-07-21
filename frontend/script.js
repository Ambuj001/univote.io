document.addEventListener('DOMContentLoaded', () => {
    // --- Timer functionality ---
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const progressRingBar = document.querySelector('.progress-ring-bar');
    const radius = progressRingBar.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    progressRingBar.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRingBar.style.strokeDashoffset = circumference;

    let timeLeft = 60; // Total seconds for the timer (e.g., 60 seconds for 01:00)
    let totalTime = 60; // The initial total time for percentage calculation

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        minutesDisplay.textContent = String(minutes).padStart(2, '0');
        secondsDisplay.textContent = String(seconds).padStart(2, '0');

        const percentage = (timeLeft / totalTime); // Percentage remaining
        const offset = circumference - (percentage * circumference);
        progressRingBar.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            minutesDisplay.textContent = '00';
            secondsDisplay.textContent = '00';
            progressRingBar.style.strokeDashoffset = 0; // Fill completely
        }
        timeLeft--;
    }

    // Start the timer (you can trigger this with a button click if needed)
    let timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Call once immediately to set initial state


    // --- Results Chart (Conic Gradient) ---
    const chartCircle = document.querySelector('.chart-circle');
    const percentage = chartCircle.dataset.percentage || 0; // Get percentage from data-attribute

    // Update the background conic gradient based on the percentage
    chartCircle.style.background = `conic-gradient(var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`;


    // --- Optional: Toggle Switch Interaction ---
    const toggleSwitches = document.querySelectorAll('.switch input');
    toggleSwitches.forEach(switchInput => {
        switchInput.addEventListener('change', () => {
            if (switchInput.checked) {
                console.log('Toggle is ON');
                // Add any specific logic when toggle is ON
            } else {
                console.log('Toggle is OFF');
                // Add any specific logic when toggle is OFF
            }
        });
    });

    // --- Optional: Button Click Effects ---
    const neumorphicBtns = document.querySelectorAll('.neumorphic-btn');
    neumorphicBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Add a temporary "pressed" effect
            btn.style.boxShadow = `inset var(--inner-shadow-strength) var(--inner-shadow-strength) calc(var(--inner-shadow-strength) * 2) var(--dark-shadow),
                                   inset calc(var(--inner-shadow-strength) * -1) calc(var(--inner-shadow-strength) * -1) calc(var(--inner-shadow-strength) * 2) var(--light-shadow)`;
            setTimeout(() => {
                // Revert to original shadow after a short delay
                if (btn.classList.contains('primary') || btn.classList.contains('danger')) {
                     btn.style.boxShadow = `var(--outer-shadow-strength) var(--outer-shadow-strength) calc(var(--outer-shadow-strength) * 2) var(--dark-shadow),
                                             calc(var(--outer-shadow-strength) * -1) calc(var(--outer-shadow-strength) * -1) calc(var(--outer-shadow-strength) * 2) var(--light-shadow)`;
                } else {
                     // For secondary buttons, it's the same shadow, but could be different if needed
                      btn.style.boxShadow = `var(--outer-shadow-strength) var(--outer-shadow-strength) calc(var(--outer-shadow-strength) * 2) var(--dark-shadow),
                                             calc(var(--outer-shadow-strength) * -1) calc(var(--outer-shadow-strength) * -1) calc(var(--outer-shadow-strength) * 2) var(--light-shadow)`;
                }

            }, 200);
        });
    });

    // Connect Wallet Button example
    const connectWalletBtn = document.querySelector('.connect-wallet-btn');
    connectWalletBtn.addEventListener('click', () => {
        alert('Connecting Wallet...'); // Replace with actual wallet connection logic
    });

});