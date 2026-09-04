document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       TODAY'S OPPORTUNITY ROTATION
       ========================================= */

    const opportunities = [
        {
            crop: "Tomato",
            price: "Rs 42",
            unit: "/ kg",
            change: "Up 8.4% from yesterday",
            market1: "Motihari Market",
            price1: "Rs 42",
            market2: "Muzaffarpur Market",
            price2: "Rs 45"
        },
        {
            crop: "Rice",
            price: "Rs 37",
            unit: "/ kg",
            change: "Up 5.7% from yesterday",
            market1: "Motihari Market",
            price1: "Rs 37",
            market2: "Patna Market",
            price2: "Rs 40"
        },
        {
            crop: "Wheat",
            price: "Rs 28",
            unit: "/ kg",
            change: "Up 3.2% from yesterday",
            market1: "Gaya Market",
            price1: "Rs 28",
            market2: "Patna Market",
            price2: "Rs 30"
        },
        {
            crop: "Maize",
            price: "Rs 23",
            unit: "/ kg",
            change: "Up 2.6% from yesterday",
            market1: "Motihari Market",
            price1: "Rs 23",
            market2: "Muzaffarpur Market",
            price2: "Rs 25"
        },
        {
            crop: "Potato",
            price: "Rs 35",
            unit: "/ kg",
            change: "Down 1.8% from yesterday",
            market1: "Muzaffarpur Market",
            price1: "Rs 35",
            market2: "Patna Market",
            price2: "Rs 38"
        },
        {
            crop: "Onion",
            price: "Rs 43",
            unit: "/ kg",
            change: "Up 4.1% from yesterday",
            market1: "Patna Market",
            price1: "Rs 43",
            market2: "Gaya Market",
            price2: "Rs 46"
        }
    ];

    let index = 0;

    function updateOpportunity() {

        const card = document.querySelector(".farm-card");

        if (!card) return;

        const data = opportunities[index];

        const title = card.querySelector("h3");
        const price = card.querySelector(".price");
        const change = card.querySelector(".price-change");
        const rows = card.querySelectorAll(".market-row");

        if (title) {
            title.textContent = data.crop;
        }

        if (price) {
            price.innerHTML =
                data.price + " <small>" + data.unit + "</small>";
        }

        if (change) {
            change.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M5 17L17 5"/>
                    <path d="M8 5h9v9"/>
                </svg>
                ${data.change}
            `;
        }

        if (rows.length >= 2) {

            const firstSpan = rows[0].querySelector("span");
            const secondSpan = rows[1].querySelector("span");

            if (firstSpan) {
                firstSpan.textContent = data.market1;
            }

            if (secondSpan) {
                secondSpan.textContent = data.market2;
            }

            const firstPrice = rows[0].querySelector("strong");
            const secondPrice = rows[1].querySelector("strong");

            if (firstPrice) {
                firstPrice.textContent = data.price1;
            }

            if (secondPrice) {
                secondPrice.textContent = data.price2;
            }
        }

        index = (index + 1) % opportunities.length;
    }

    updateOpportunity();

    setInterval(updateOpportunity, 5000);

});


