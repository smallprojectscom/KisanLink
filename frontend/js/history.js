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

    const role =
        (sessionStorage.getItem("kisanlink_role") || "").toLowerCase();

    const userId =
        sessionStorage.getItem("kisanlink_user_id");

    const userName =
        sessionStorage.getItem("kisanlink_user_name") || "";

    const feed =
        document.getElementById("historyFeed");

    const count =
        document.getElementById("dealCount");

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");

    const backButton =
        document.getElementById("backButton");

    const userElement =
        document.getElementById("userName");


    if (userElement) {
        userElement.textContent =
            userName ||
            (role === "farmer" ? "Farmer" : "Buyer");
    }


    if (role !== "farmer" && role !== "buyer") {
        window.location.href = "auth.html";
        return;
    }


    if (!userId) {
        window.location.href = "auth.html";
        return;
    }


    if (role === "buyer") {

        title.textContent =
            "My Transactions";

        subtitle.textContent =
            "Track your purchases from farmers";

        backButton.href =
            "buyer-dashboard.html";
    }


    async function loadHistory() {

        try {

            feed.innerHTML = `
                <div class="loading">
                    <div class="loader"></div>
                    <p>Loading transaction history...</p>
                </div>
            `;


            const response =
                await fetch(
                    "window.KL_API/api/deals?user_id=" +
                    encodeURIComponent(userId) +
                    "&role=" +
                    encodeURIComponent(role)
                );


            const text =
                await response.text();


            let data;

            try {
                data = JSON.parse(text);
            }
            catch (error) {
                throw new Error("Invalid server response");
            }


            const deals =
                Array.isArray(data)
                    ? data
                    : (data.deals || []);


            count.textContent =
                deals.length;


            if (deals.length === 0) {

                feed.innerHTML = `
                    <div class="empty">

                        <div class="empty-icon">
                            📭
                        </div>

                        <h3>
                            No transactions yet
                        </h3>

                        <p>
                            Your active and completed
                            deals will appear here.
                        </p>

                    </div>
                `;

                return;
            }


            feed.innerHTML =
                deals.map(renderDeal).join("");

        }
        catch (error) {

            console.error(error);

            feed.innerHTML = `
                <div class="error">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Could not load history
                    </h3>

                    <p>
                        Make sure the KisanLink backend
                        is running.
                    </p>

                </div>
            `;
        }
    }


    function renderDeal(deal) {

        const status =
            String(
                deal.status || "active"
            ).toLowerCase();


        const quantity =
            Number(deal.quantity || 0);


        const price =
            Number(deal.agreed_price || 0);


        const total =
            Number(
                deal.total ||
                quantity * price
            );


        const person =
            role === "farmer"
                ? deal.buyer_name
                : deal.farmer_name;


        const mobile =
            role === "farmer"
                ? deal.buyer_mobile
                : deal.farmer_mobile;


        const completeButton =
            status === "active"

            ? `
                <button
                    class="complete-btn"
                    onclick="completeDeal(${deal.id})"
                >
                    ✅ Mark Deal Completed
                </button>
              `

            : "";


        return `
            <article class="deal-card">

                <div class="deal-header">

                    <div class="crop">

                        <div class="crop-icon">
                            🌾
                        </div>

                        <div>

                            <div class="crop-name">
                                ${escapeHtml(
                                    deal.crop_name ||
                                    "Crop"
                                )}
                            </div>

                            <div class="location">
                                📍 ${
                                    escapeHtml(
                                        deal.location ||
                                        "Location"
                                    )
                                }
                            </div>

                        </div>

                    </div>


                    <span class="status ${status}">
                        ${status.toUpperCase()}
                    </span>

                </div>


                <div class="details">

                    <div class="detail">

                        <span class="label">
                            ${
                                role === "farmer"
                                    ? "Buyer"
                                    : "Farmer"
                            }
                        </span>

                        <span class="value">
                            👤 ${
                                escapeHtml(
                                    person || "User"
                                )
                            }
                        </span>

                    </div>


                    <div class="detail">

                        <span class="label">
                            Quantity
                        </span>

                        <span class="value">
                            📦 ${quantity}
                            ${
                                escapeHtml(
                                    deal.unit || "unit"
                                )
                            }
                        </span>

                    </div>


                    <div class="detail">

                        <span class="label">
                            Agreed Price
                        </span>

                        <span class="value">
                            ₹${price.toFixed(2)}
                        </span>

                    </div>


                    <div class="detail">

                        <span class="label">
                            Contact
                        </span>

                        <span class="value">
                            📱 ${
                                escapeHtml(
                                    mobile || "N/A"
                                )
                            }
                        </span>

                    </div>

                </div>


                <div class="total">

                    <span>
                        💰 Total Deal Value
                    </span>

                    <strong>
                        ₹${total.toFixed(2)}
                    </strong>

                </div>


                ${completeButton}

            </article>
        `;
    }


    window.completeDeal =
        async function (dealId) {

        if (
            !confirm(
                "Mark this deal as completed?"
            )
        ) {
            return;
        }


        try {

            const response =
                await fetch(
                    "window.KL_API/api/deals/complete",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            deal_id: Number(dealId),

                            user_id: Number(userId)

                        })
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                alert(
                    "Deal marked as completed."
                );

                loadHistory();

            }
            else {

                alert(
                    result.message ||
                    "Could not complete deal."
                );
            }

        }
        catch (error) {

            console.error(error);

            alert(
                "Cannot connect to KisanLink backend."
            );
        }
    };


    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    loadHistory();

});










