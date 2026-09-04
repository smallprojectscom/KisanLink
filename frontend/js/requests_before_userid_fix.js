document.addEventListener("DOMContentLoaded", function () {

    const role =
        (sessionStorage.getItem("kisanlink_role") || "").toLowerCase();

    const userId =
        sessionStorage.getItem("kisanlink_user_id");

    const userName =
        sessionStorage.getItem("kisanlink_user_name") || "";

    const feed =
        document.getElementById("requestsFeed");

    const count =
        document.getElementById("requestCount");

    const topUser =
        document.getElementById("topUserName");

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");


    if (topUser) {
        topUser.textContent =
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
            "My Buy Requests";

        subtitle.textContent =
            "Track the requests you have sent to farmers";
    }


    async function loadRequests() {

        try {

            feed.innerHTML = `
                <div class="loading-card">
                    <div class="loader"></div>
                    <p>Loading requests...</p>
                </div>
            `;


            const response =
                await fetch(
                    "http://127.0.0.1:8081/api/requests?user_id=" +
                    encodeURIComponent(userId) +
                    "&role=" +
                    encodeURIComponent(role)
                );


            const text =
                await response.text();


            let data;

            try {
                data = JSON.parse(text);
            } catch (error) {

                throw new Error(
                    "Invalid server response"
                );
            }


            const requests =
                Array.isArray(data)
                    ? data
                    : (data.requests || []);


            count.textContent =
                requests.length;


            if (requests.length === 0) {

                feed.innerHTML = `
                    <div class="empty-card">
                        <div class="empty-icon">📭</div>
                        <h3>No requests yet</h3>
                        <p>
                            ${
                                role === "farmer"
                                ? "Buyer requests for your crops will appear here."
                                : "Your crop purchase requests will appear here."
                            }
                        </p>
                    </div>
                `;

                return;
            }


            feed.innerHTML =
                requests
                .map(renderRequest)
                .join("");


        } catch (error) {

            console.error(error);

            feed.innerHTML = `
                <div class="error-card">
                    <div class="empty-icon">⚠️</div>
                    <h3>Could not load requests</h3>
                    <p>
                        Make sure the KisanLink backend is running.
                    </p>
                </div>
            `;
        }
    }


    function renderRequest(request) {

        const status =
            String(request.status || "pending")
            .toLowerCase();


        const otherPerson =
            request.buyer_name ||
            (role === "farmer"
                ? "Buyer"
                : "Farmer");


        const quantity =
            Number(request.quantity || 0);


        const price =
            Number(request.price || 0);


        const actionButtons =
            role === "farmer" &&
            status === "pending"

            ? `
                <div class="actions">

                    <button
                        class="action-btn accept-btn"
                        onclick="updateRequest(
                            ${request.id},
                            'accepted'
                        )"
                    >
                        ✅ Accept
                    </button>

                    <button
                        class="action-btn reject-btn"
                        onclick="updateRequest(
                            ${request.id},
                            'rejected'
                        )"
                    >
                        ❌ Reject
                    </button>

                </div>
            `

            : "";


        return `
            <article class="request-card">

                <div class="request-top">

                    <div class="crop-info">

                        <div class="crop-icon">
                            🌾
                        </div>

                        <div>

                            <div class="crop-name">
                                ${escapeHtml(
                                    request.crop_name ||
                                    "Crop"
                                )}
                            </div>

                            <div class="crop-location">
                                📍 ${
                                    escapeHtml(
                                        request.location ||
                                        "Location not available"
                                    )
                                }
                            </div>

                        </div>

                    </div>


                    <span class="status ${status}">
                        ${status.toUpperCase()}
                    </span>

                </div>


                <div class="request-details">

                    <div class="detail">

                        <span class="detail-label">
                            ${role === "farmer"
                                ? "Buyer"
                                : "Farmer"}
                        </span>

                        <span class="detail-value">
                            👤 ${escapeHtml(otherPerson)} ${role === "farmer" ? `<span style="display:inline-block;margin-left:8px;padding:3px 8px;border-radius:20px;background:#e8f7ee;color:#16733a;font-size:11px;font-weight:700;">✓ Verified Buyer</span>` : ""}
                        </span>

                    </div>


                    <div class="detail">

                        <span class="detail-label">
                            Quantity
                        </span>

                        <span class="detail-value">
                            📦 ${quantity} ${
                                escapeHtml(
                                    request.unit || "unit"
                                )
                            }
                        </span>

                    </div>


                    <div class="detail">

                        <span class="detail-label">
                            Price
                        </span>

                        <span class="detail-value">
                            ₹${price.toFixed(2)}
                        </span>

                    </div>


                    <div class="detail">

                        <span class="detail-label">
                            Mobile
                        </span>

                        <span class="detail-value">
                            📱 ${
                                escapeHtml(
                                    request.buyer_mobile ||
                                    "Not available"
                                )
                            }
                        </span>

                    </div>

                </div>


                <div class="message-box">

                    💬
                    ${
                        escapeHtml(
                            request.message ||
                            "No message provided."
                        )
                    }

                </div>


                ${actionButtons}

            </article>
        `;
    }


    window.updateRequest =
        async function (
            requestId,
            status
        ) {

        if (role !== "farmer") {
            return;
        }


        const action =
            status === "accepted"
                ? "accept"
                : "reject";


        const confirmed =
            confirm(
                "Are you sure you want to " +
                action +
                " this request?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8081/api/requests/status",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            request_id: Number(requestId),

                            farmer_id:
                                String(userId),

                            status:
                                status
                        })
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                alert(
                    result.message ||
                    "Request updated successfully."
                );

                loadRequests();

            } else {

                alert(
                    result.message ||
                    "Could not update request."
                );
            }


        } catch (error) {

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


    loadRequests();

});








