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

    const form = document.getElementById("sellCropForm");

    if (!form) {
        console.error("sellCropForm not found");
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const farmerId = sessionStorage.getItem("kisanlink_user_id");

        if (!farmerId) {
            alert("Please login first.");
            window.location.href = "auth.html";
            return;
        }

        const data = {
            farmer_id: farmerId,
            crop_name: document.getElementById("cropName").value.trim(),
            quantity: document.getElementById("quantity").value.trim(),
            unit: document.getElementById("unit").value,
            price: document.getElementById("price").value.trim(),
            location: document.getElementById("location").value.trim(),
            description: document.getElementById("description").value.trim()
        };

        if (!data.crop_name || !data.quantity || !data.price || !data.location) {
            alert("Please fill all required fields.");
            return;
        }

        try {

            const response = await fetch(
                "window.KL_API/api/products",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if (result.success) {

                alert("Crop listed successfully!");

                form.reset();

                window.location.href = "market.html";

            } else {

                alert(result.message || "Could not list crop.");

            }

        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to KisanLink server.\n\n" +
                "Please make sure the backend is running."
            );

        }

    });

});








