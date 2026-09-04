document.addEventListener("DOMContentLoaded", function () {

    const role =
        (sessionStorage.getItem("kisanlink_role") || "")
        .toLowerCase();

    const name =
        sessionStorage.getItem("kisanlink_user_name") ||
        "KisanLink User";


    /* Role */

    const panelLabel =
        document.getElementById("panelLabel");

    const profileRole =
        document.getElementById("profileRole");

    const accountRole =
        document.getElementById("accountRole");

    if (role === "farmer") {

        if (panelLabel)
            panelLabel.textContent = "Farmer Panel";

        if (profileRole)
            profileRole.textContent = "Farmer Account";

        if (accountRole)
            accountRole.textContent = "Farmer";

    } else if (role === "buyer") {

        if (panelLabel)
            panelLabel.textContent = "Buyer Panel";

        if (profileRole)
            profileRole.textContent = "Buyer Account";

        if (accountRole)
            accountRole.textContent = "Buyer";
    }


    /* User name */

    const profileName =
        document.getElementById("profileName");

    const profileAvatar =
        document.getElementById("profileAvatar");

    if (profileName)
        profileName.textContent = name;

    if (profileAvatar && name.length > 0)
        profileAvatar.textContent =
            name.charAt(0).toUpperCase();


    /* Dashboard link */

    const dashboardLink =
        document.querySelector(".dashboard-link");

    if (dashboardLink) {

        if (role === "buyer") {
            dashboardLink.href = "buyer-dashboard.html";
        } else {
            dashboardLink.href = "farmer-dashboard.html";
        }

    }


    /* Farmer-only navigation */

    if (role !== "farmer") {

        document
            .querySelectorAll(".farmer-only")
            .forEach(function (item) {
                item.style.display = "none";
            });

    }


    /* Notifications preference */

    const notificationToggle =
        document.getElementById("notificationToggle");

    if (notificationToggle) {

        const saved =
            localStorage.getItem(
                "kisanlink_notifications"
            );

        if (saved !== null) {
            notificationToggle.checked =
                saved === "true";
        }

        notificationToggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "kisanlink_notifications",
                    notificationToggle.checked
                );

            }
        );
    }


    /* Logout */

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                sessionStorage.clear();

                window.location.href =
                    "auth.html";
            }
        );

    }

});


