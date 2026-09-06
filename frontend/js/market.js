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

    const feed = document.getElementById("marketFeed");
    const search = document.getElementById("marketSearch");

    let products = [];
    let selectedProduct = null;

    function initials(name) {
        if (!name) return "F";
        const parts = name.trim().split(/\s+/);
        let result = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
            result += parts[parts.length - 1].charAt(0).toUpperCase();
        }
        return result;
    }

    function cropIcon(crop) {
        const c = String(crop).toLowerCase();

        if (c.includes("wheat") || c.includes("rice") || c.includes("paddy")) return "🌾";
        if (c.includes("maize") || c.includes("corn")) return "🌽";
        if (c.includes("tomato")) return "🍅";
        if (c.includes("potato")) return "🥔";
        if (c.includes("onion")) return "🧅";
        if (c.includes("mango")) return "🥭";

        return "🌱";
    }

    async function loadProducts(filters = {}) {

        feed.innerHTML = '<div class="loading">🔎 Searching farmer products...</div>';

        try {

            const params = new URLSearchParams();

            if (filters.search) {
                params.append("crop", filters.search);
            }

            if (filters.location) {
                params.append("location", filters.location);
            }

            if (filters.min_price) {
                params.append("min_price", filters.min_price);
            }

            if (filters.max_price) {
                params.append("max_price", filters.max_price);
            }

            const query = params.toString();

            const response = await fetch(
                window.KL_API + "/api/products" + (query ? "?" + query : ""),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Server returned " + response.status);
            }

            const data = await response.json();

            products = Array.isArray(data)
                ? data
                : (data.products || data.data || []);

            renderProducts(products);

        } catch (error) {

            console.error("Market error:", error);

            feed.innerHTML = `
                <div class="empty">
                    <h2>Unable to load market</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()"
                        style="
                            margin-top:15px;
                            padding:12px 20px;
                            border:0;
                            border-radius:10px;
                            background:#174d32;
                            color:white;
                            cursor:pointer;
                        ">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    function renderProducts(list) {

        document.getElementById("productCount").textContent = list.length;

        const farmerIds = new Set(
            list.map(p => p.farmer_id)
        );

        document.getElementById("farmerCount").textContent = farmerIds.size;

        if (list.length === 0) {

            feed.innerHTML = `
                <div class="empty">
                    <h2>🌱 No matching crops</h2>
                    <p>Try another crop, location or price range.</p>
                </div>
            `;

            return;
        }

        feed.innerHTML = "";

        list.forEach(function (product) {

            const farmer = product.farmer_name || "Farmer";
            const crop = product.crop_name || "Crop";
            const quantity = product.quantity || 0;
            const unit = product.unit || "kg";
            const price = product.price || 0;
            const location = product.location || "Location not provided";

            const description =
                product.description ||
                "Fresh agricultural produce directly from farmer.";

            const card = document.createElement("article");

            card.className = "crop-post";

            card.innerHTML = `
                <div class="post-header">

                    <div class="farmer-info">

                        <div class="farmer-avatar">
                            ${initials(farmer)}
                        </div>

                        <div>
                            <div class="farmer-name">
                                ${farmer}
                            </div>

                            <div class="farmer-location">
                                📍 ${location}
                            </div>
                        </div>

                    </div>

                    <div class="verified">
                        ✓ Farmer
                    </div>

                </div>

                <div class="crop-visual">

                    <div class="crop-emoji">
                        ${cropIcon(crop)}
                    </div>

                    <div class="crop-label">
                        Fresh ${crop}
                    </div>

                </div>

                <div class="post-actions">
                    ♡ &nbsp;&nbsp; 💬 &nbsp;&nbsp; ↗
                </div>

                <div class="post-body">

                    <h2>${crop}</h2>

                    <div class="price">
                        ₹${Number(price).toFixed(2)}
                        <small>/ ${unit}</small>
                    </div>

                    <div class="details">

                        <div class="detail">
                            <span>AVAILABLE QUANTITY</span>
                            <strong>${quantity} ${unit}</strong>
                        </div>

                        <div class="detail">
                            <span>FARM LOCATION</span>
                            <strong>${location}</strong>
                        </div>

                    </div>

                    <div class="description">
                        ${description}
                    </div>

                </div>

                <div class="post-footer">

                    <button
                        class="buy-btn"
                        data-id="${product.id}">
                        🛒 Request to Buy
                    </button>

                    <button
                        class="contact-btn"
                        data-farmer="${farmer}">
                        Contact
                    </button>

                </div>
            `;

            card.querySelector(".buy-btn")
                .addEventListener("click", function () {
                    openRequest(product);
                });

            card.querySelector(".contact-btn")
                .addEventListener("click", function () {

                    alert(
                        "Contact request for " +
                        farmer +
                        ".\n\nThe farmer will receive your request."
                    );

                });

            feed.appendChild(card);
        });
    }

    function openRequest(product) {

        const role =
            (
                sessionStorage.getItem("kisanlink_role") || ""
            ).toLowerCase();

        if (!role) {
            alert("Please login first.");
            window.location.href = "auth.html";
            return;
        }

        if (role !== "buyer") {
            alert("Only Buyer accounts can send buy requests.");
            return;
        }

        selectedProduct = product;

        document.getElementById("requestCropName").textContent =
            "Requesting: " + product.crop_name;

        document.getElementById("requestQuantity").value = "";
        document.getElementById("requestMessage").value = "";

        document.getElementById("requestModal").classList.add("show");
    }

    window.closeRequest = function () {

        document.getElementById("requestModal")
            .classList.remove("show");

        selectedProduct = null;
    };

    window.sendRequest = async function () {

        if (!selectedProduct) return;

        const buyerId =
            sessionStorage.getItem("kisanlink_user_id");

        const quantity =
            document.getElementById("requestQuantity").value.trim();

        const message =
            document.getElementById("requestMessage").value.trim();

        if (!buyerId) {
            alert("Please login first.");
            return;
        }

        if (!quantity) {
            alert("Please enter quantity.");
            return;
        }

        try {

            const response = await fetch(
                window.KL_API + "/api/requests",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        product_id: Number(selectedProduct.id),
                        buyer_id: Number(buyerId),
                        quantity: Number(quantity),
                        message: message ||
                            "I want to buy this crop."
                    })
                }
            );

            const result = await response.json();

            if (result.success) {

                alert("✅ Buy request sent successfully!");

                closeRequest();

            } else {

                alert(
                    result.message ||
                    "Request failed."
                );
            }

        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to KisanLink backend."
            );
        }
    };

    /*
       Real backend search.
       Enter crop name in the existing search box.
    */

    let searchTimer;

    search.addEventListener("input", function () {

        clearTimeout(searchTimer);

        const value =
            search.value.trim();

        searchTimer = setTimeout(function () {

            loadProducts({
                search: value
            });

        }, 300);

    });

    /*
       Extra filters can be used by the new
       search controls added in the next step.
    */

    window.applyMarketFilters = function () {

        const crop =
            document.getElementById("marketSearch")?.value.trim() || "";

        const location =
            document.getElementById("marketLocation")?.value.trim() || "";

        const minPrice =
            document.getElementById("marketMinPrice")?.value || "";

        const maxPrice =
            document.getElementById("marketMaxPrice")?.value || "";

        loadProducts({
            search: crop,
            location: location,
            min_price: minPrice,
            max_price: maxPrice
        });
    };

    window.resetMarketFilters = function () {

        if (document.getElementById("marketSearch"))
            document.getElementById("marketSearch").value = "";

        if (document.getElementById("marketLocation"))
            document.getElementById("marketLocation").value = "";

        if (document.getElementById("marketMinPrice"))
            document.getElementById("marketMinPrice").value = "";

        if (document.getElementById("marketMaxPrice"))
            document.getElementById("marketMaxPrice").value = "";

        loadProducts();
    };

    loadProducts();

});





