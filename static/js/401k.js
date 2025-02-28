function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.getElementById("toast-container").appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function getBalance() {
    const fundsElement = document.getElementById("funds");
    const balanceElement = document.getElementById("balance");
    
    if (!fundsElement || !balanceElement) {
        console.error("Required DOM elements not found for getBalance()");
        return;
    }

    fetch(`/apps/401k/balance`)
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => {
            fundsElement.innerText = `$${data.funds}`;
            balanceElement.innerText = `$${data['401k_balance']}`;
        })
        .catch(err => {
            console.error("Error fetching balance:", err);
            fundsElement.innerText = "Error loading funds";
            balanceElement.innerText = "Error loading balance";
            showToast("Failed to load balance!", "error");
        });
}

function contribute() {
    const amountElement = document.getElementById("amount");
    
    if (!amountElement) {
        console.error("Amount input element not found");
        showToast("Error: Contribution form not found", "error");
        return;
    }
    
    let amount = parseFloat(amountElement.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Enter a valid contribution amount!", "error");
        return;
    }

    showToast("Processing contribution...", "success");
    
    fetch('/apps/401k/contribute', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount })
    })
    .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    })
    .then(data => {
        if (data.message.includes("Error") || data.message.includes("Invalid")) {
            showToast("Contribution failed: " + data.message, "error");
        } else {
            showToast(data.message, "success");
        }
        
        const fundsElement = document.getElementById("funds");
        const balanceElement = document.getElementById("balance");
        
        if (fundsElement && balanceElement) {
            fundsElement.innerText = `$${data.funds}`;
            balanceElement.innerText = `$${data['401k_balance']}`;
        }
    })
    .catch(err => {
        console.error("Error processing contribution:", err);
        showToast("Contribution failed!", "error");
    });
}

function resetAccount() {
    if (!confirm("Are you sure you want to reset your account? This will set your funds to $10,000 and your 401k balance to $0.")) {
        return;
    }

    showToast("Processing reset request...", "success");
    
    fetch('/apps/401k/reset', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    })
    .then(data => {
        showToast(data.message, "success");
        
        const fundsElement = document.getElementById("funds");
        const balanceElement = document.getElementById("balance");
        
        if (fundsElement && balanceElement) {
            fundsElement.innerText = `$${data.funds}`;
            balanceElement.innerText = `$${data['401k_balance']}`;
        }
    })
    .catch(err => {
        console.error("Error resetting account:", err);
        showToast("Reset failed!", "error");
    });
}

function initializeApp() {
    console.log("401k app initialized");
    
    const contributeBtn = document.getElementById("contribute-btn");
    if (contributeBtn) {
        contributeBtn.addEventListener("click", contribute);
        console.log("Contribute button event listener attached");
    } else {
        console.error("Contribute button not found");
    }
    
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetAccount);
        console.log("Reset button event listener attached");
    } else {
        console.error("Reset button not found");
    }
    
    getBalance();
}

function cleanupApp() {
    console.log("401k app cleanup");
    
    const contributeBtn = document.getElementById("contribute-btn");
    if (contributeBtn) {
        contributeBtn.removeEventListener("click", contribute);
    }
    
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
        resetBtn.removeEventListener("click", resetAccount);
    }
}

window.initializeApp = initializeApp;
window.cleanupApp = cleanupApp;
window.contribute = contribute;
window.getBalance = getBalance;

document.addEventListener('DOMContentLoaded', function() {
    console.log("401k.js loaded via DOMContentLoaded");
    if (document.getElementById("funds") && document.getElementById("balance")) {
        getBalance();
    }
});

console.log("401k.js executed");
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (document.getElementById("funds") && document.getElementById("balance")) {
        getBalance();
    }
}