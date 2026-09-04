/* =========================================================
   KISANLINK - REAL DASHBOARD DATA
   SQLite -> C Backend -> Dashboard
   ========================================================= */

const KL_API = "http://127.0.0.1:8081";


document.addEventListener("DOMContentLoaded", function () {

    loadRealDashboard();

});


async function loadRealDashboard() {

    const userId =
        Number(sessionStorage.getItem("kisanlink_user_id"));

    const role =
        (sessionStorage.getItem("kisanlink_role") || "")
        .toLowerCase();

    if (!userId || !role) {
        return;
    }

    try {

        const [
            productsResponse,
            requestsResponse,
            dealsResponse
        ] = await Promise.all([

            fetch(`${KL_API}/api/products`),

            fetch(
                `${KL_API}/api/requests?user_id=${userId}&role=${role}`
            ),

            fetch(
                `${KL_API}/api/deals?user_id=${userId}&role=${role}`
            )

        ]);


        const productsData =
            await productsResponse.json();

        const requestsData =
            await requestsResponse.json();

        const dealsData =
            await dealsResponse.json();


        const products =
            productsData.products ||
            productsData.data ||
            (Array.isArray(productsData) ? productsData : []);


        const requests =
            requestsData.requests ||
            requestsData.data ||
            [];


        const deals =
            dealsData.deals ||
            dealsData.data ||
            [];


        if (role === "farmer") {

            loadFarmerRealData(
                userId,
                products,
                requests,
                deals
            );

        }

        if (role === "buyer") {

            loadBuyerRealData(
                userId,
                products,
                requests,
                deals
            );

        }


    } catch (error) {

        console.error(
            "KisanLink dashboard API error:",
            error
        );

    }

}


/* =========================================================
   FARMER
   ========================================================= */

function loadFarmerRealData(
    userId,
    products,
    requests,
    deals
) {

    /* Only this farmer's listings */

    const myProducts =
        products.filter(function (product) {

            return Number(
                product.farmer_id
            ) === userId;

        });


    /* Active listings */

    const activeProducts =
        myProducts.filter(function (product) {

            return String(
                product.status || ""
            ).toLowerCase() === "available";

        });


    /* Genuine incoming requests */

    const incomingRequests =
        requests.filter(function (request) {

            return Number(
                request.buyer_id
            ) !== userId;

        });


    /* Pending incoming requests */

    const pendingRequests =
        incomingRequests.filter(function (request) {

            return String(
                request.status || ""
            ).toLowerCase() === "pending";

        });


    /* Active deals */

    const activeDeals =
        deals.filter(function (deal) {

            return String(
                deal.status || ""
            ).toLowerCase() === "active";

        });


    /* Completed deals */

    const completedDeals =
        deals.filter(function (deal) {

            return String(
                deal.status || ""
            ).toLowerCase() === "completed";

        });


    /* =====================================================
       TODAY'S SALES
       ===================================================== */

    let todaySales = 0;

    const now = new Date();

    const todayString =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

    completedDeals.forEach(function (deal) {

        if (!deal.created_at) return;

        const dealDateString =
            String(deal.created_at).slice(0, 10);

        if (dealDateString === todayString) {

            const quantity =
                Number(deal.quantity) || 0;

            const price =
                Number(deal.agreed_price) || 0;

            todaySales += quantity * price;

        }

    });

    const todaySalesElement =
        document.getElementById("todaySales");

    if (todaySalesElement) {
        todaySalesElement.textContent =
            "\u20B9" +
            todaySales.toLocaleString("en-IN");
    }

    const salesInfoElement =
        document.getElementById("salesInfo");

    if (salesInfoElement) {
        salesInfoElement.textContent =
            completedDeals.length +
            (
                completedDeals.length === 1
                    ? " completed sale"
                    : " completed sales"
            );
    }


    /* =====================================================
       ACTIVE LISTINGS
       ===================================================== */

    document.getElementById(
        "activeListings"
    ).textContent =
        activeProducts.length;


    document.getElementById(
        "listingInfo"
    ).textContent =
        activeProducts.length === 1
            ? "1 active crop"
            : activeProducts.length + " active crops";


    /* =====================================================
       BUYER REQUESTS
       ===================================================== */

    document.getElementById(
        "buyerRequests"
    ).textContent =
        pendingRequests.length;


    document.getElementById(
        "requestInfo"
    ).textContent =
        pendingRequests.length === 0
            ? "No pending requests"
            : "Need your response";


    /* =====================================================
       MARKET REACH
       ===================================================== */

    const buyerIds = new Set();

    incomingRequests.forEach(function (request) {

        if (request.buyer_id) {

            buyerIds.add(
                Number(request.buyer_id)
            );

        }

    });


    document.getElementById(
        "marketReach"
    ).textContent =
        buyerIds.size;


    document.getElementById(
        "reachInfo"
    ).textContent =
        buyerIds.size === 1
            ? "Interested buyer"
            : "Interested buyers";


    /* =====================================================
       CROP LISTINGS
       GROUP DUPLICATE CROP RECORDS
       ===================================================== */

    renderGroupedCropListings(
        activeProducts
    );


    /* =====================================================
       REQUEST LIST
       ===================================================== */

    renderFarmerRequests(
        pendingRequests
    );


    /* =====================================================
       OPPORTUNITY
       ===================================================== */

    renderFarmerOpportunity(
        activeProducts
    );

}


/* =========================================================
   GROUP CROP LISTINGS
   ========================================================= */

function renderGroupedCropListings(products) {

    const container =
        document.getElementById(
            "realCropListings"
        );

    if (!container) return;


    const grouped = {};


    products.forEach(function (product) {

        const crop =
            String(
                product.crop_name || "Unknown Crop"
            );


        const key =
            crop.toLowerCase();


        if (!grouped[key]) {

            grouped[key] = {

                crop: crop,

                listings: 0,

                quantity: 0,

                unit:
                    product.unit || "kg",

                price:
                    Number(product.price || 0),

                status:
                    product.status || "available"

            };

        }


        grouped[key].listings++;

        grouped[key].quantity +=
            Number(product.quantity || 0);

    });


    const crops =
        Object.values(grouped);


    if (crops.length === 0) {

        container.innerHTML = `
            <div style="
                padding:30px 10px;
                text-align:center;
                color:#6d7d72;
            ">
                No active crop listings.
            </div>
        `;

        return;

    }


    container.innerHTML =
        crops.slice(0, 5).map(function (crop) {

            return `

            <div class="crop-row">

                <div class="crop-image wheat">
                    ??
                </div>

                <div class="crop-info">

                    <strong>
                        ${escapeDashboard(crop.crop)}
                    </strong>

                    <span>
                        ${crop.quantity.toLocaleString("en-IN")}
                        ${escapeDashboard(crop.unit)}
                        · ?${crop.price.toLocaleString("en-IN")}/${escapeDashboard(crop.unit)}
                        · ${crop.listings}
                        ${crop.listings === 1 ? "listing" : "listings"}
                    </span>

                </div>

                <span class="status available">
                    Available
                </span>

            </div>

            `;

        }).join("");

}


/* =========================================================
   FARMER REQUESTS
   ========================================================= */

function renderFarmerRequests(requests) {

    const container =
        document.getElementById(
            "realBuyerRequests"
        );

    if (!container) return;


    if (requests.length === 0) {

        container.innerHTML = `
            <div style="
                padding:30px 10px;
                text-align:center;
                color:#6d7d72;
            ">
                No pending buyer requests.
            </div>
        `;

        return;

    }


    container.innerHTML =
        requests.slice(0, 5).map(function (request) {

            const buyer =
                request.person_name ||
                request.buyer_name ||
                "Buyer";


            return `

            <div class="request-row">

                <div class="buyer-avatar">
                    ${escapeDashboard(
                        buyer.charAt(0).toUpperCase()
                    )}
                </div>

                <div class="request-info">

                    <strong>
                        ${escapeDashboard(buyer)}
                    </strong>

                    <span>
                        Looking for
                        ${Number(
                            request.quantity || 0
                        ).toLocaleString("en-IN")}
                        ${escapeDashboard(
                            request.unit || "kg"
                        )}
                        ${escapeDashboard(
                            request.crop_name || "crop"
                        )}
                    </span>

                </div>

                <button
                    class="small-button"
                    onclick="window.location.href='requests.html'">
                    Respond
                </button>

            </div>

            `;

        }).join("");

}


/* =========================================================
   FARMER OPPORTUNITY
   ========================================================= */

function renderFarmerOpportunity(products) {

    const recommendation =
        document.querySelector(
            ".recommendation"
        );

    if (!recommendation) return;


    const heading =
        recommendation.querySelector("h3");


    const paragraph =
        recommendation.querySelector("p");


    if (products.length === 0) {

        if (heading)
            heading.textContent =
                "Start selling your crops";

        if (paragraph)
            paragraph.textContent =
                "List your agricultural products and connect directly with buyers.";

        return;

    }


    const firstCrop =
        products[0];


    if (heading) {

        heading.textContent =
            `${firstCrop.crop_name} is listed`;

    }


    if (paragraph) {

        paragraph.innerHTML =
            `Your listed price is ?${Number(
                firstCrop.price || 0
            ).toLocaleString("en-IN")}/${escapeDashboard(
                firstCrop.unit || "kg"
            )}. Check Market Prices for current market information.`;

    }

}


/* =========================================================
   BUYER
   ========================================================= */

function loadBuyerRealData(
    userId,
    products,
    requests,
    deals
) {

    /* ===============================
       REAL BUYER COUNTS
       =============================== */

    const pendingRequests =
        requests.filter(function (r) {

            return String(r.status || "")
                .toLowerCase() === "pending";

        });


    const completedDeals =
        deals.filter(function (d) {

            return String(d.status || "")
                .toLowerCase() === "completed";

        });


    const activeDeals =
        deals.filter(function (d) {

            return String(d.status || "")
                .toLowerCase() === "active";

        });


    /* ===============================
       STAT CARDS
       =============================== */

    const available =
        document.getElementById(
            "buyerAvailableListings"
        );

    const myRequests =
        document.getElementById(
            "buyerMyRequests"
        );

    const pending =
        document.getElementById(
            "buyerPendingRequests"
        );

    const purchases =
        document.getElementById(
            "buyerPurchases"
        );


    if (available)
        available.textContent =
            products.length;


    if (myRequests)
        myRequests.textContent =
            requests.length;


    if (pending)
        pending.textContent =
            pendingRequests.length;


    if (purchases)
        purchases.textContent =
            completedDeals.length;


    const listingInfo =
        document.getElementById(
            "buyerListingsInfo"
        );


    if (listingInfo) {

        listingInfo.textContent =
            products.length === 1
                ? "Farmer product"
                : "Farmer products";

    }


    const pendingInfo =
        document.getElementById(
            "buyerPendingInfo"
        );


    if (pendingInfo) {

        pendingInfo.textContent =
            pendingRequests.length === 0
                ? "No pending requests"
                : "Waiting for farmer response";

    }


    const purchaseInfo =
        document.getElementById(
            "buyerPurchaseInfo"
        );


    if (purchaseInfo) {

        purchaseInfo.textContent =
            activeDeals.length > 0
                ? `${activeDeals.length} active · ${completedDeals.length} completed`
                : `${completedDeals.length} completed purchases`;

    }


    /* ===============================
       FARMER PRODUCTS
       =============================== */

    const productList =
        document.getElementById(
            "buyerProductList"
        );


    if (productList) {

        if (products.length === 0) {

            productList.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#6d7d72;
                ">
                    No farmer products available.
                </div>
            `;

        } else {

            productList.innerHTML =
                products.slice(0, 8)
                .map(function (product) {

                    return `

                    <div class="crop-row">

                        <div class="crop-image wheat">
                            ??
                        </div>

                        <div class="crop-info">

                            <strong>
                                ${escapeDashboard(
                                    product.crop_name || "Crop"
                                )}
                            </strong>

                            <span>
                                ${Number(
                                    product.quantity || 0
                                ).toLocaleString("en-IN")}
                                ${escapeDashboard(
                                    product.unit || "kg"
                                )}
                                · ?${Number(
                                    product.price || 0
                                ).toLocaleString("en-IN")}/${escapeDashboard(
                                    product.unit || "kg"
                                )}
                                · ${escapeDashboard(
                                    product.farmer_name || "Farmer"
                                )}
                            </span>

                        </div>

                        <span class="status available">
                            Available
                        </span>

                    </div>

                    `;

                }).join("");

        }

    }


    /* ===============================
       BUYER REQUESTS
       =============================== */

    const requestList =
        document.getElementById(
            "buyerRequestList"
        );


    if (requestList) {

        if (requests.length === 0) {

            requestList.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#6d7d72;
                ">
                    No requests yet.
                </div>
            `;

        } else {

            requestList.innerHTML =
                requests.slice(0, 6)
                .map(function (request) {

                    const status =
                        String(
                            request.status || "pending"
                        ).toLowerCase();


                    return `

                    <div class="request-row">

                        <div class="buyer-avatar">
                            ${
                                status === "accepted"
                                    ? "?"
                                    : status === "rejected"
                                        ? "×"
                                        : "?"
                            }
                        </div>

                        <div class="request-info">

                            <strong>
                                ${escapeDashboard(
                                    request.crop_name ||
                                    "Crop"
                                )}
                            </strong>

                            <span>
                                ${Number(
                                    request.quantity || 0
                                ).toLocaleString("en-IN")}
                                ${escapeDashboard(
                                    request.unit || "kg"
                                )}
                                · ?${Number(
                                    request.price || 0
                                ).toLocaleString("en-IN")}
                                · ${capitalizeDashboard(status)}
                            </span>

                        </div>

                    </div>

                    `;

                }).join("");

        }

    }


    /* ===============================
       RECENT PURCHASES
       =============================== */

    const purchaseList =
        document.getElementById(
            "buyerPurchaseList"
        );


    if (purchaseList) {

        if (completedDeals.length === 0) {

            purchaseList.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#6d7d72;
                ">
                    No completed purchases yet.
                </div>
            `;

        } else {

            purchaseList.innerHTML =
                completedDeals.slice(0, 5)
                .map(function (deal) {

                    return `

                    <div class="request-row">

                        <div class="buyer-avatar">
                            ?
                        </div>

                        <div class="request-info">

                            <strong>
                                ${escapeDashboard(
                                    deal.crop_name || "Crop"
                                )}
                            </strong>

                            <span>
                                ${Number(
                                    deal.quantity || 0
                                ).toLocaleString("en-IN")}
                                ${escapeDashboard(
                                    deal.unit || "kg"
                                )}
                                · ?${Number(
                                    deal.total || 0
                                ).toLocaleString("en-IN")}
                                · ${escapeDashboard(
                                    deal.farmer_name || "Farmer"
                                )}
                            </span>

                        </div>

                    </div>

                    `;

                }).join("");

        }

    }


    /* ===============================
       BUYING OPPORTUNITY
       =============================== */

    const title =
        document.getElementById(
            "buyerOpportunityTitle"
        );

    const text =
        document.getElementById(
            "buyerOpportunityText"
        );


    if (products.length > 0) {

        const product =
            products[0];


        if (title) {

            title.textContent =
                `${product.crop_name || "Fresh crop"} available`;

        }


        if (text) {

            text.innerHTML =
                `${Number(
                    product.quantity || 0
                ).toLocaleString("en-IN")}
                ${escapeDashboard(
                    product.unit || "kg"
                )}
                available from
                <strong>
                    ${escapeDashboard(
                        product.farmer_name || "a farmer"
                    )}
                </strong>
                at ?${Number(
                    product.price || 0
                ).toLocaleString("en-IN")}/${escapeDashboard(
                    product.unit || "kg"
                )}.`;

        }

    } else {

        if (title)
            title.textContent =
                "No products available";


        if (text)
            text.textContent =
                "Check the market later for new farmer listings.";

    }

}


/* =========================================================
   SECURITY / HTML ESCAPE
   ========================================================= */

function escapeDashboard(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}







