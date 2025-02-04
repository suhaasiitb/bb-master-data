document.addEventListener("DOMContentLoaded", function () {
    const fetchButton = document.getElementById("fetchButton");
    const resultContainer = document.getElementById("resultContainer");
    const dailyResultContainer = document.getElementById("dailyResultContainer");
    const resultTableBody = document.getElementById("resultTableBody");
    const dailyResultTableBody = document.getElementById("dailyResultTableBody");

    resultContainer.style.display = "none";
    dailyResultContainer.style.display = "none";

    fetchButton.addEventListener("click", function () {
        const year = document.getElementById("year").value;
        const month = document.getElementById("month").value;
        const week = document.getElementById("week").value;
        const employeeId = document.getElementById("employeeId").value;

        if (!year || !month || !week || !employeeId) {
            alert("Please fill in all fields before fetching data.");
            return;
        }

        const payoutFile = `data/${year}/${month}/W-${week}.json`;
        const dailyFile = `data/${year}/${month}/W-${week}-daily.json`;

        // Fetch Payout Data
        fetch(payoutFile)
            .then(response => response.ok ? response.json() : Promise.reject("Payout data not found"))
            .then(data => {
                const employeeData = data["PAYOUT DATA"].find(item => item.cee_id == employeeId);
                resultTableBody.innerHTML = "";

                if (!employeeData) {
                    alert("No payout data found for the selected Employee ID.");
                    resultContainer.style.display = "none";
                    return;
                }

                for (const [key, value] of Object.entries(employeeData)) {
                    if (value && value !== "0") {
                        const row = document.createElement("tr");
                        row.innerHTML = `<td>${key}</td><td>${value}</td>`;
                        resultTableBody.appendChild(row);
                    }
                }

                resultContainer.style.display = "block";
            })
            .catch(error => {
                console.error(error);
                resultContainer.style.display = "none";
            });

        // Fetch Daily Earnings Data
        fetch(dailyFile)
            .then(response => response.ok ? response.json() : Promise.reject("Daily earnings data not found"))
            .then(data => {
                const employeeData = data.find(item => item["BB ID"] == employeeId);
                dailyResultTableBody.innerHTML = "";

                if (!employeeData) {
                    alert("No daily earnings data found for the selected Employee ID.");
                    dailyResultContainer.style.display = "none";
                    return;
                }

                let earningsMap = {};

                // Process the earnings data
                Object.keys(employeeData).forEach(key => {
                    if (key.includes("Pay")) {
                        let earningsDayMatch = key.match(/^(\d+)/);
                        if (earningsDayMatch) {
                            let day = parseInt(earningsDayMatch[1]);
                            earningsMap[day] = employeeData[key]; // Store earnings against the numeric day
                        }
                    }
                });

                // Process Orders Delivered
                Object.keys(employeeData).forEach(key => {
                    let dateMatch = key.match(/^(\d+)-(\w+)-(\d{4})$/);
                    if (dateMatch) {
                        let day = parseInt(dateMatch[1]); // Extract day from Orders Delivered format
                        let ordersDelivered = employeeData[key];
                        let earnings = earningsMap[day] || 0; // Fetch earnings from map, default to 0 if not found

                        const row = document.createElement("tr");
                        row.innerHTML = `<td>${key}</td><td>${ordersDelivered}</td><td>${earnings}</td>`;
                        dailyResultTableBody.appendChild(row);
                    }
                });

                dailyResultContainer.style.display = "block";
            })
            .catch(error => {
                console.error(error);
                dailyResultContainer.style.display = "none";
            });
    });
});
