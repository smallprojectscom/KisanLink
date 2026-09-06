/* =========================================================
   KISANLINK API CONFIGURATION
   Localhost -> Local Python backend
   Online    -> Render production backend
   ========================================================= */

window.KL_API = window.KL_API || (
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://127.0.0.1:8081"
        : "https://kisanlink-35wr.onrender.com"
);

document.addEventListener("DOMContentLoaded", function () {

    

    const loginForm = document.getElementById("loginFormElement");
    const registerForm = document.getElementById("registerFormElement");

    const loginSection = document.getElementById("loginForm");
    const registerSection = document.getElementById("registerForm");

    /* =====================================================
       FORM SWITCHING
    ===================================================== */

    window.showRegister = function () {

        if (loginSection) {
            loginSection.classList.remove("active");
            loginSection.style.display = "none";
        }

        if (registerSection) {
            registerSection.classList.add("active");
            registerSection.style.display = "block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    window.showLogin = function () {

        if (registerSection) {
            registerSection.classList.remove("active");
            registerSection.style.display = "none";
        }

        if (loginSection) {
            loginSection.classList.add("active");
            loginSection.style.display = "block";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    window.togglePassword = function (inputId, button) {

        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        if (input.type === "password") {

            input.type = "text";

            if (button) {
                button.textContent = "Hide";
            }

        } else {

            input.type = "password";

            if (button) {
                button.textContent = "Show";
            }
        }
    };


    /* =====================================================
       FARMER / BUYER ROLE SELECTION
    ===================================================== */

    const roleCards = document.querySelectorAll(".role-card");
    const roleInput = document.getElementById("registerRole");

    roleCards.forEach(function (card) {

        card.addEventListener("click", function () {

            roleCards.forEach(function (item) {
                item.classList.remove("selected");
            });

            card.classList.add("selected");

            const selectedRole = card.getAttribute("data-role");

            if (roleInput && selectedRole) {
                roleInput.value = selectedRole;
            }

            console.log("Selected role:", selectedRole);
        });

    });


    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const identifier =
                document.getElementById("loginIdentity")?.value.trim();

            const password =
                document.getElementById("loginPassword")?.value;

            if (!identifier || !password) {

                alert("Please enter email/mobile and password.");

                return;
            }

            try {

                const response = await fetch(
                    window.KL_API + "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            identifier: identifier,
                            password: password
                        })
                    }
                );

                const result = await response.json();

                console.log("LOGIN RESPONSE:", result);

                if (!response.ok || !result.success) {

                    alert(
                        result.message ||
                        "Login failed."
                    );

                    return;
                }

                sessionStorage.setItem(
                    "kisanlink_user_id",
                    String(result.user_id)
                );

                sessionStorage.setItem(
                    "kisanlink_role",
                    String(result.role || "").toLowerCase()
                );

                sessionStorage.setItem(
                    "kisanlink_user_name",
                    result.name || "User"
                );

                sessionStorage.setItem(
                    "kisanlink_logged_in",
                    "true"
                );

                const role =
                    String(result.role || "").toLowerCase();

                if (role === "buyer") {

                    window.location.replace(
                        "./buyer-dashboard.html"
                    );

                } else if (role === "farmer") {

                    window.location.replace(
                        "./farmer-dashboard.html"
                    );

                } else {

                    alert("Unknown user role.");
                }

            } catch (error) {

                console.error("Login error:", error);

                alert(
                    "Cannot connect to KisanLink server.\n" +
                    "Please make sure the C backend is running on port 8081."
                );
            }

        });
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("registerName")?.value.trim();

            const email =
                document.getElementById("registerEmail")?.value.trim();

            const mobile =
                document.getElementById("registerMobile")?.value.trim();

            const state =
                document.getElementById("registerState")?.value.trim();

            const district =
                document.getElementById("registerDistrict")?.value.trim();

            const pincode =
                document.getElementById("registerPincode")?.value.trim();

            const role =
                document.getElementById("registerRole")?.value;

            const password =
                document.getElementById("registerPassword")?.value;

            if (
                !name ||
                !email ||
                !mobile ||
                !state ||
                !district ||
                !pincode ||
                !role ||
                !password
            ) {

                alert(
                    "Please fill all required fields and select Farmer or Buyer."
                );

                return;
            }


            try {

                const response = await fetch(
                    window.KL_API + "/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            name: name,
                            email: email,
                            mobile: mobile,
                            state: state,
                            district: district,
                            pincode: pincode,
                            role: role,
                            password: password

                        })
                    }
                );


                const result = await response.json();

                console.log(
                    "REGISTER RESPONSE:",
                    result
                );


                if (!response.ok || !result.success) {

                    alert(
                        result.message ||
                        "Registration failed."
                    );

                    return;
                }


                alert(
                    result.message ||
                    "Registration successful. Please login."
                );


                registerForm.reset();


                /* Reset role to Farmer */

                if (roleInput) {
                    roleInput.value = "farmer";
                }

                roleCards.forEach(function (card) {

                    if (
                        card.getAttribute("data-role") === "farmer"
                    ) {
                        card.classList.add("selected");
                    } else {
                        card.classList.remove("selected");
                    }

                });


                window.showLogin();

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Cannot connect to KisanLink server.\n" +
                    "Please make sure the C backend is running on port 8081."
                );
            }

        });
    }


    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

    const forgotPassword =
        document.getElementById("forgotPassword");

    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                alert(
                    "Password recovery will be added in a future version."
                );

            }
        );
    }


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    if (loginSection) {
        loginSection.style.display = "block";
        loginSection.classList.add("active");
    }

    if (registerSection) {
        registerSection.style.display = "none";
        registerSection.classList.remove("active");
    }

});








