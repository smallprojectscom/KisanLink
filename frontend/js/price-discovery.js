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

const PRICE_API = "https://farmer.in/api/open/prices.json";
const KISANLINK_PRICE_API = "window.KL_API/api/prices";

let allPrices = [];

const $ = id => document.getElementById(id);

async function loadPrices() {
    const loading = $("loading");
    const errorBox = $("errorBox");

    try {
        if (loading) loading.style.display = "block";
        if (errorBox) errorBox.style.display = "none";

        const response = await fetch(PRICE_API, { cache: "no-store" });

        if (!response.ok)
            throw new Error("API HTTP " + response.status);

        const data = await response.json();

        if (Array.isArray(data.commodities)) {
            allPrices = data.commodities;
        } else if (Array.isArray(data)) {
            allPrices = data;
        } else {
            allPrices = [];
        }

        console.log(
            "KisanLink live mandi prices:",
            allPrices.length
        );

        if (loading) loading.style.display = "none";

    } catch (err) {

        console.error("PRICE API ERROR:", err);

        if (loading) loading.style.display = "none";

        if (errorBox) {
            errorBox.style.display = "block";
            errorBox.textContent =
                "Unable to load live mandi prices.";
        }
    }
}


async function getKisanLinkPrices(crop) {

    try {

        const response = await fetch(
            KISANLINK_PRICE_API +
            "?crop=" +
            encodeURIComponent(crop),
            {
                cache: "no-store"
            }
        );

        if (!response.ok)
            return null;

        const data = await response.json();

        if (!data.success || !data.count)
            return null;

        return data;

    } catch (error) {

        console.warn(
            "KisanLink price API unavailable:",
            error
        );

        return null;
    }
}


async function searchCrop() {

    const input = $("cropSearch");
    const query =
        (input?.value || "").trim().toLowerCase();

    if (!query) {
        alert("Please enter a crop name.");
        return;
    }

    const matches = allPrices.filter(item => {

        const name = String(
            item.name ||
            item.commodity ||
            item.crop ||
            ""
        ).toLowerCase();

        return name.includes(query);
    });

    if (!matches.length) {

        if ($("priceResult"))
            $("priceResult").style.display = "none";

        if ($("emptyBox")) {

            $("emptyBox").style.display = "block";

            $("emptyBox").textContent =
                'No live mandi price found for "' +
                input.value +
                '".';
        }

        return;
    }


    const prices = matches
        .map(x =>
            Number(
                x.price ||
                x.modal_price ||
                0
            )
        )
        .filter(x => x > 0);


    const mins = matches
        .map(x =>
            Number(
                x.min ||
                x.min_price ||
                x.price ||
                0
            )
        )
        .filter(x => x > 0);


    const maxs = matches
        .map(x =>
            Number(
                x.max ||
                x.max_price ||
                x.price ||
                0
            )
        )
        .filter(x => x > 0);


    if (!prices.length) {

        alert("Price data unavailable for this crop.");

        return;
    }


    const mandiAvg =
        prices.reduce(
            (a, b) => a + b,
            0
        ) / prices.length;


    const mandiMin = Math.min(...mins);
    const mandiMax = Math.max(...maxs);


    const name =
        matches[0].name ||
        input.value;


    const unit =
        matches[0].unit ||
        "quintal";


    const money = n =>
        "₹" +
        Number(n).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );


    /*
       Get KisanLink farmer prices
    */

    const kisanData =
        await getKisanLinkPrices(
            input.value
        );


    let finalAvg = mandiAvg;
    let finalMin = mandiMin;
    let finalMax = mandiMax;

    let trend = "→ Live";
    let signal = "Live mandi market";


    if (kisanData) {

        finalAvg =
            kisanData.average_price;

        finalMin =
            Math.min(
                mandiMin,
                Number(kisanData.minimum_price)
            );

        finalMax =
            Math.max(
                mandiMax,
                Number(kisanData.maximum_price)
            );

        trend =
            kisanData.trend ||
            "→ Stable";

        signal =
            kisanData.signal ||
            "KisanLink market data";
    }


    if ($("resultCrop"))
        $("resultCrop").textContent = name;


    if ($("averagePrice"))
        $("averagePrice").textContent =
            money(finalAvg);


    if ($("minimumPrice"))
        $("minimumPrice").textContent =
            money(finalMin);


    if ($("maximumPrice"))
        $("maximumPrice").textContent =
            money(finalMax);


    if ($("listingCount"))
        $("listingCount").textContent =
            matches.length;


    if ($("suggestedPrice"))
        $("suggestedPrice").textContent =
            money(finalAvg);


    if ($("rangeMin"))
        $("rangeMin").textContent =
            money(finalMin);


    if ($("rangeAverage"))
        $("rangeAverage").textContent =
            money(finalAvg);


    if ($("rangeMax"))
        $("rangeMax").textContent =
            money(finalMax);

    if ($("rangeFill")) {
        const range = finalMax - finalMin;

        let position = 50;

        if (range > 0) {
            position =
                ((finalAvg - finalMin) / range) * 100;
        }

        position = Math.max(5, Math.min(95, position));

        $("rangeFill").style.width =
            position + "%";
    }


    if ($("suggestedRange"))
        $("suggestedRange").textContent =
            money(finalMin) +
            " – " +
            money(finalMax) +
            " / " +
            unit;


    if ($("recommendationText"))
        $("recommendationText").textContent =
            "Current indicative price for " +
            name +
            " is around " +
            money(finalAvg) +
            " per " +
            unit +
            ". Compare buyer offers before selling.";


    if ($("farmerListings"))
        $("farmerListings").textContent =
            matches.length +
            " live mandi price records";


    if ($("trendBadge"))
        $("trendBadge").textContent =
            trend;


    if ($("marketSignal"))
        $("marketSignal").textContent =
            signal;


    if ($("emptyBox"))
        $("emptyBox").style.display = "none";


    if ($("priceResult"))
        $("priceResult").style.display = "block";
}


window.searchCrop = searchCrop;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            $("searchBtn");

        if (button) {

            button.type = "button";

            button.addEventListener(
                "click",
                searchCrop
            );

            console.log(
                "Discover Price button connected"
            );

        } else {

            console.error(
                "searchBtn NOT FOUND"
            );
        }


        const input =
            $("cropSearch");

        if (input) {

            input.addEventListener(
                "keydown",
                e => {

                    if (e.key === "Enter") {

                        e.preventDefault();

                        searchCrop();
                    }
                }
            );
        }


        loadPrices();
    }
);






