/* ===== PREVENT OLD DEMO DATA FLASH ===== */

document.addEventListener("DOMContentLoaded", function () {

    const stats = document.querySelectorAll(".stats-grid .stat-card");

    if (stats.length >= 4) {

        stats[0].querySelector("h3").textContent = "Loading...";
        stats[0].querySelector("small").textContent = "Fetching real data...";

        stats[1].querySelector("h3").textContent = "Loading...";
        stats[1].querySelector("small").textContent = "Fetching real data...";

        stats[2].querySelector("h3").textContent = "Loading...";
        stats[2].querySelector("small").textContent = "Fetching real data...";

        stats[3].querySelector("h3").textContent = "Loading...";
        stats[3].querySelector("small").textContent = "Fetching real data...";
    }


    const cropList = document.querySelector(".crop-list");

    if (cropList) {
        cropList.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:#718077;
                font-weight:600;
            ">
                Loading your crop listings...
            </div>
        `;
    }


    const requestList = document.querySelector(".request-list");

    if (requestList) {
        requestList.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:#718077;
                font-weight:600;
            ">
                Loading buyer requests...
            </div>
        `;
    }

});


