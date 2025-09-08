// ==UserScript==
// @name         SL TECH BD V1.6 (24hr Password + URL Mask + Auto Redirect)
// @match        *://market-qx.pro/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const allowedPassword = "passvul25";
    const passwordKey = "sltech_verified_info";

    // ✅ Step 1: Redirect if actual URL is /en/trade
    if (window.location.pathname === "/en/trade") {
        window.location.replace("https://market-qx.pro/en/demo-trade");
        return;
    }

    // ✅ Step 2: Force fake URL + tab title
    function forceURLAndTitle() {
        document.title = "Live trading | Quotex";
        history.replaceState(null, "", "https://market-qx.pro/en/trade");
    }

    // Password system
    localStorage.removeItem("isVerified");

    function checkPassword() {
        const saved = localStorage.getItem(passwordKey);
        const now = new Date().getTime();

        if (saved) {
            const parsed = JSON.parse(saved);
            if (now - parsed.timestamp < 24 * 60 * 60 * 1000 && parsed.verified === true) {
                return true;
            } else {
                localStorage.removeItem(passwordKey);
            }
        }

        let userPassword = prompt("Enter your SL TECH BD password:");
        if (userPassword === allowedPassword) {
            localStorage.setItem(passwordKey, JSON.stringify({
                verified: true,
                timestamp: now
            }));
            return true;
        } else {
            alert("Incorrect password! Access denied.");
            document.body.innerHTML = "";
            return false;
        }
    }

    let initialBalance = 0;
    let previousBalance = 0;

    function updateSelectBalanceElement(balanceValue) {
        const balanceDisplay = document.querySelector('.usermenu__select-balance');
        if (balanceDisplay) {
            balanceDisplay.textContent = `$${parseFloat(balanceValue).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    }

    function getInitialBalance() {
        const saved = localStorage.getItem("initialBalanceInfo");
        const now = new Date().getTime();

        if (saved) {
            const parsed = JSON.parse(saved);
            if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
                initialBalance = parseFloat(parsed.balance);
                previousBalance = initialBalance;
                updateSelectBalanceElement(initialBalance);
                return;
            }
        }

        let input = prompt("Capital Balance:");
        if (input && !isNaN(input)) {
            initialBalance = parseFloat(input);
            previousBalance = initialBalance;
            localStorage.setItem("initialBalanceInfo", JSON.stringify({
                balance: initialBalance,
                timestamp: now
            }));
            updateSelectBalanceElement(initialBalance);
        } else {
            alert("Invalid input. Please reload and try again.");
        }
    }

    function initProfitDisplay() {
        let profitElement = document.querySelector('.position__header-money.--green');
        if (profitElement) {
            profitElement.innerText = "$0.00";
            profitElement.style.color = "#0faf59";
        }
    }

    function updateBalance() {
        let profitElement = document.querySelector('.position__header-money.--green');
        let userBalanceElement = document.querySelector('.usermenu__info-balance');

        if (profitElement && userBalanceElement) {
            let currentBalance = parseFloat(userBalanceElement.innerText.replace(/[^0-9.]/g, ''));
            if (!isNaN(currentBalance)) {
                let difference = currentBalance - initialBalance;
                let formatted = Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                if (difference > 0) {
                    profitElement.innerText = `$${formatted}`;
                    profitElement.style.color = "#0faf59";
                } else if (difference < 0) {
                    profitElement.innerText = `-$${formatted}`;
                    profitElement.style.color = "#ff3e3e";
                } else {
                    profitElement.innerText = "$0.00";
                    profitElement.style.color = "#0faf59";
                }

                previousBalance = currentBalance;
            }
        }
    }

    function updateProfileLevelIcon() {
        let balanceElement = document.querySelector('.usermenu__info-balance');
        let iconElement = document.querySelector('.usermenu__info-levels svg use');

        if (balanceElement && iconElement) {
            let balance = parseFloat(balanceElement.innerText.replace(/[^0-9.]/g, ''));
            let newClass = "icon-profile-level-standart";
            let newHref = "/profile/images/spritemap.svg#icon-profile-level-standart";

            if (balance > 4999.99 && balance <= 9999.99) {
                newClass = "icon-profile-level-pro";
                newHref = "/profile/images/spritemap.svg#icon-profile-level-pro";
            } else if (balance > 9999.99) {
                newClass = "icon-profile-level-vip";
                newHref = "/profile/images/spritemap.svg#icon-profile-level-vip";
            }

            iconElement.setAttribute("class", newClass);
            iconElement.setAttribute("xlink:href", newHref);
        }
    }

    function updateAccountType() {
        let nameElement = document.querySelector('.usermenu__info-name');
        if (nameElement) {
            let savedName = localStorage.getItem("quotex_account_type") || "Live Account";
            nameElement.innerText = savedName;
            nameElement.style.color = "#0faf59";
        }
    }

    function updateAll() {
        updateAccountType();
        updateBalance();
        updateProfileLevelIcon();
    }

    function addResetButton() {
        const target = document.body;
        if (document.getElementById("resetInitialBalanceBtn")) return;

        const button = document.createElement("button");
        button.id = "resetInitialBalanceBtn";
        button.textContent = "📹";
        button.style.position = "fixed";
        button.style.bottom = "20px";
        button.style.right = "20px";
        button.style.zIndex = "9999";
        button.style.padding = "10px 15px";
        button.style.backgroundColor = "#0f0f0f";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = "6px";
        button.style.cursor = "pointer";
        button.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

        button.addEventListener("click", () => {
            localStorage.removeItem("initialBalanceInfo");
            location.reload();
        });

        target.appendChild(button);
    }

    function updateLoadingBarColor() {
        const userBalanceElement = document.querySelector('.usermenu__info-balance');
        const loadingBar = document.querySelector('.position__loading');
        if (userBalanceElement && loadingBar) {
            const currentBalance = parseFloat(userBalanceElement.innerText.replace(/[^0-9.]/g, ''));
            if (!isNaN(currentBalance)) {
                if (currentBalance < initialBalance) {
                    loadingBar.style.backgroundColor = "#db4635";
                } else if (currentBalance > initialBalance) {
                    loadingBar.style.backgroundColor = "#0faf59";
                } else {
                    loadingBar.style.backgroundColor = "";
                }
            }
        }
    }

    window.addEventListener("load", () => {
        if (checkPassword()) {
            getInitialBalance();
            initProfitDisplay();
            updateAll();
            addResetButton();

            setInterval(() => {
                updateAll();
                updateLoadingBarColor();
                forceURLAndTitle();
            }, 500);
        }
    });
})();
