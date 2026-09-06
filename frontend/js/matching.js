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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("matchForm");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            findMatches();
        });
    }
});

async function findMatches() {

    const crop =
        document.getElementById("crop")?.value.trim() || "";

    const quantity =
        parseFloat(
            document.getElementById("quantity")?.value || 0
        );

    const location =
        document.getElementById("location")?.value.trim() || "";

    const price =
        parseFloat(
            document.getElementById("price")?.value || 0
        );

    const results =
        document.getElementById("results");

    const summary =
        document.getElementById("summary");

    const matchList =
        document.getElementById("matchList");

    if (!crop || quantity <= 0 || !location || price <= 0) {

        if (summary) {
            summary.innerHTML = `
                <div class="match-error">
                    ⚠️ Please enter crop, quantity, location and maximum price.
                </div>
            `;
        }

        if (results) {
            results.classList.remove("hidden");
        }

        return;
    }

    if (results) {
        results.classList.remove("hidden");
    }

    if (summary) {
        summary.innerHTML = `
            <div class="match-summary">
                <div>
                    <span>Crop</span>
                    <strong>${escapeHtml(crop)}</strong>
                </div>

                <div>
                    <span>Required</span>
                    <strong>${quantity}</strong>
                </div>

                <div>
                    <span>Max Price</span>
                    <strong>₹${price}</strong>
                </div>
            </div>

            <p>🔄 Finding the best farmer matches...</p>
        `;
    }

    if (matchList) {
        matchList.innerHTML = "";
    }

    try {

        const response = await fetch(
            "window.KL_API/api/match",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    crop: crop,
                    quantity: quantity,
                    location: location,
                    max_price: price
                })
            }
        );

        const data = await response.json();

        console.log("KisanLink Matching API:", data);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to find matches"
            );
        }

        const matches = Array.isArray(data.matches)
            ? data.matches
            : [];

        if (summary) {
            summary.innerHTML = `
                <div class="match-summary">
                    <div>
                        <span>Crop</span>
                        <strong>${escapeHtml(crop)}</strong>
                    </div>

                    <div>
                        <span>Required</span>
                        <strong>${quantity}</strong>
                    </div>

                    <div>
                        <span>Max Price</span>
                        <strong>₹${price}</strong>
                    </div>

                    <div>
                        <span>Matches Found</span>
                        <strong>${matches.length}</strong>
                    </div>
                </div>
            `;
        }

        if (!matches.length) {

            if (matchList) {
                matchList.innerHTML = `
                    <div class="match-error">
                        😔 No suitable farmers found
                        for your requirement.
                    </div>
                `;
            }

            return;
        }

        if (matchList) {
            matchList.innerHTML =
                matches
                    .map((match, index) => {

                        return createMatchCard(
                            {
                                ...match,
                                rank: match.rank || index + 1
                            }
                        );

                    })
                    .join("");
        }

    }
    catch (error) {

        console.error(
            "Matching API error:",
            error
        );

        if (summary) {
            summary.innerHTML = `
                <div class="match-error">
                    ❌ ${escapeHtml(error.message)}
                </div>
            `;
        }

        if (matchList) {
            matchList.innerHTML = `
                <div class="match-error">
                    Please make sure the KisanLink
                    backend is running on port 8081.
                </div>
            `;
        }
    }
}

function createMatchCard(match) {

    let medal = "🥉";
    let title = "THIRD MATCH";
    let rankClass = "third";

    if (match.rank === 1) {

        medal = "🥇";
        title = "BEST MATCH";
        rankClass = "best";

    }
    else if (match.rank === 2) {

        medal = "🥈";
        title = "SECOND MATCH";
        rankClass = "second";
    }

    const score = Number(match.match_score ?? match.score) || 0;

    return `
        <div class="match-card ${rankClass}">

            <div class="match-top">

                <div class="match-rank">

                    <span class="medal">
                        ${medal}
                    </span>

                    <div>
                        <small>
                            ${title}
                        </small>

                        <h3>
                            ${escapeHtml(
                                match.farmer_name || "Farmer"
                            )}
                        </h3>

                        ${
                            Number(match.verified) === 1
                                ? '<span class="verified-badge">✓ Verified Farmer</span>'
                                : '<span class="unverified-badge">Farmer</span>'
                        }
                    </div>

                </div>

                <div class="score-box">

                    <strong>
                        ${score}%
                    </strong>

                    <span>
                        Match Score
                    </span>

                </div>

            </div>

            <div class="score-bar">

                <div
                    style="width:${score}%">
                </div>

            </div>

            <div class="match-details">

                <div>
                    <span>🌾 Crop</span>

                    <strong>
                        ${escapeHtml(
                            match.crop_name || ""
                        )}
                    </strong>
                </div>

                <div>
                    <span>📦 Available</span>

                    <strong>
                        ${match.quantity ?? 0}
                        ${escapeHtml(
                            match.unit || ""
                        )}
                    </strong>
                </div>

                <div>
                    <span>₹ Price</span>

                    <strong>
                        ₹${match.price ?? 0}
                        /
                        ${escapeHtml(
                            match.unit || ""
                        )}
                    </strong>
                </div>

                <div>
                    <span>📍 Location</span>

                    <strong>
                        ${escapeHtml(
                            match.location || ""
                        )}
                    </strong>
                </div>

            </div>

            <div class="match-footer">

                <span>
                    ✓ Suitable for your requirement
                </span>

                <button
                    type="button"
                    onclick="contactFarmer(
                        '${escapeHtml(
                            match.farmer_mobile || match.mobile || ""
                        )}'
                    )">

                    📞 Contact Farmer

                </button>

            </div>

        </div>
    `;
}

function contactFarmer(mobile) {

    if (!mobile) {

        alert(
            "Farmer contact number is not available."
        );

        return;
    }

    window.location.href =
        "tel:" + mobile;
}

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.findMatches = findMatches;
window.contactFarmer = contactFarmer;










