/* =========================================================
   REAL DASHBOARD DATA LOADER
   ========================================================= */

const KL_API = "http://127.0.0.1:8081";

async function loadRealDashboardData() {

    const userId =
        sessionStorage.getItem("kisanlink_user_id");

    const role =
        (sessionStorage.getItem("kisanlink_role") || "")
        .toLowerCase();

    if (!userId || !role) {
        document.documentElement.classList.remove(
            "dashboard-data-loading"
        );
        return;
    }

    try {

        const productsResponse =
            await fetch(`${KL_API}/api/products`);

        const productsData =
            await productsResponse.json();

        const products =
            productsData.products ||
            productsData.data ||
            (Array.isArray(productsData)
                ? productsData
                : []);


        const requestsResponse =
            await fetch(
                `${KL_API}/api/requests?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`
            );

        const requestsData =
            await requestsResponse.json();

        const requests =
            requestsData.requests ||
            requestsData.data ||
            (Array.isArray(requestsData)
                ? requestsData
                : []);


        const dealsResponse =
            await fetch(
                `${KL_API}/api/deals?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`
            );

        const dealsData =
            await dealsResponse.json();

        const deals =
            dealsData.deals ||
            dealsData.data ||
            (Array.isArray(dealsData)
                ? dealsData
                : []);


        if (role === "farmer") {

            renderFarmerDashboard(
                products,
                requests,
                deals
            );

        } else if (role === "buyer") {

            renderBuyerDashboard(
                products,
                requests,
                deals
            );

        }

    } catch (error) {

        console.error(
            "KisanLink dashboard error:",
            error
        );

    } finally {

        /*
           Remove loading screen only after API
           processing has finished.
        */

        document.documentElement.classList.remove(
            "dashboard-data-loading"
        );

    }
}


