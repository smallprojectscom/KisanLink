document.addEventListener("DOMContentLoaded", function () {

    const role = (sessionStorage.getItem("kisanlink_role") || "").toLowerCase();
    const name = sessionStorage.getItem("kisanlink_user_name") || "";

    if (role !== "farmer" && role !== "buyer") {
        window.location.href = "./auth.html";
        return;
    }

    const title = document.getElementById("dashboardTitle");
    const panel = document.getElementById("panelLabel");
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");
    const avatar = document.getElementById("userAvatar");

    /* NAME */
    if (userName) {
        userName.textContent = name || (role === "farmer" ? "Farmer" : "Buyer");
    }

    /* ROLE */
    if (userRole) {
        userRole.textContent =
            role === "farmer" ? "Farmer" : "Buyer";
    }

    /* AVATAR */
    if (avatar) {

        if (name) {

            const parts = name.trim().split(/\s+/);

            let initials =
                parts[0].charAt(0).toUpperCase();

            if (parts.length > 1) {
                initials +=
                    parts[parts.length - 1].charAt(0).toUpperCase();
            }

            avatar.textContent = initials;

        } else {
            avatar.textContent =
                role === "farmer" ? "F" : "B";
        }
    }

    /* GREETING */

const hour = new Date().getHours();

let greeting;

if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
} 
else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
}
else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
}
else {
    greeting = "Good Night";
}

let greetingElement =
    document.getElementById("dynamicGreeting");

if (!greetingElement && title) {

    greetingElement =
        document.createElement("div");

    greetingElement.id = "dynamicGreeting";

    greetingElement.style.fontSize = "14px";
    greetingElement.style.color = "#718077";
    greetingElement.style.marginBottom = "2px";

    title.parentNode.insertBefore(
        greetingElement,
        title
    );
}

if (greetingElement) {

    greetingElement.textContent =
        greeting + (name ? ", " + name : "");
}


/* DASHBOARD TITLE */

    if (title) {
        title.textContent =
            role === "farmer"
                ? "Farmer Dashboard"
                : "Buyer Dashboard";
    }

    if (panel) {
        panel.textContent =
            role === "farmer"
                ? "Farmer Panel"
                : "Buyer Panel";
    }

    /* FARMER-ONLY ELEMENTS */

    document.querySelectorAll(".nav-item").forEach(function (item) {

        const text =
            item.innerText.trim().toLowerCase();

        if (text.includes("sell crop")) {

            if (role === "buyer") {
                item.style.display = "none";
            } else {
                item.style.display = "flex";
            }
        }
    });

    /* BUYER DASHBOARD */

    if (role === "buyer") {

        const heroButton =
            document.querySelector(".hero-card a");

        if (heroButton) {
            heroButton.style.display = "none";
        }

        document.querySelectorAll("a").forEach(function (link) {

            const text =
                link.innerText.trim().toLowerCase();

            if (text.includes("list a crop")) {
                link.style.display = "none";
            }

            if (
                text.includes("buy / market") ||
                text.includes("buy market")
            ) {
                link.href = "market.html";
            }
        });
    }

    /* MARKET LINK FOR BOTH ROLES */

    document.querySelectorAll("a").forEach(function (link) {

        const text =
            link.innerText.trim().toLowerCase();

        if (
            text.includes("buy / market") ||
            text.includes("buy market")
        ) {
            link.href = "market.html";
        }

    });

});


/* ===== DYNAMIC FARMER / BUYER PANEL NAME ===== */

document.addEventListener("DOMContentLoaded", function () {

    const panelLabel = document.getElementById("panelLabel");

    if (!panelLabel) return;

    const role = (
        sessionStorage.getItem("kisanlink_role") || ""
    ).toLowerCase();

    if (role === "buyer") {
        panelLabel.textContent = "Buyer Panel";
    }
    else if (role === "farmer") {
        panelLabel.textContent = "Farmer Panel";
    }
    else {
        panelLabel.textContent = "Panel";
    }

});



