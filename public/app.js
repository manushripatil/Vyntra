document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("verifyBtn");
    const input = document.getElementById("ageInput");
    const result = document.getElementById("result");

    if (!button || !input || !result) {
        console.error("Missing HTML elements");
        return;
    }

    button.addEventListener("click", async () => {
        console.log("BUTTON CLICKED");

        const age = input.value;
        console.log("AGE:", age);

        if (!age) {
            result.innerText = "Please enter an age";
            return;
        }

        try {
            result.innerText = "Verifying...";

            const response = await fetch("/prove-age", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ age })
            });

            const data = await response.json();

            console.log("SERVER RESPONSE:", data);

            if (data.verified === true) {
                result.innerText = "✅ Verified (16+)";
            } else {
                result.innerText = "❌ Not Verified";
            }

        } catch (err) {
            console.error("ERROR:", err);
            result.innerText = "Server not reachable";
        }
    });
});
