(function () {

    const role =
        (sessionStorage.getItem("kisanlink_role") || "")
        .toLowerCase();

    const loggedIn =
        sessionStorage.getItem("kisanlink_logged_in") === "true";

    const page =
        window.location.pathname.toLowerCase();

    if (!loggedIn || !role) {

        window.location.replace("./auth.html");
        return;
    }

    if (
        role === "buyer" &&
        page.endsWith("/farmer-dashboard.html")
    ) {

        window.location.replace("./buyer-dashboard.html");
        return;
    }

    if (
        role === "farmer" &&
        page.endsWith("/buyer-dashboard.html")
    ) {

        window.location.replace("./farmer-dashboard.html");
        return;
    }

})();


