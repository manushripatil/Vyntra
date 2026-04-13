document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("verifyBtn");
    const input = document.getElementById("ageInput");
    const resultBox = document.getElementById("result");

    if (!button || !input) {
        console.error("Missing HTML elements (verifyBtn or ageInput)");
        return;
    }

    button.addEventListener("click", async () => {
        console.log("BUTTON CLICKED");

        const age = input.value;

        console.log("AGE:", age);

        // basic validation
        if (!age) {
            resultBox.innerText = "Please enter an age";
            return;
        }

        try {
            resultBox.innerText = "Verifying...";

            const res = await fetch("/prove-age", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ age })
            });

            if (!res.ok) {
                throw new Error("Server error");
            }

            const data = await res.json();

            console.log("SERVER RESPONSE:", data);

            if (data.verified === true) {
                resultBox.innerText = "✅ Verified (16+)";
            } else {
                resultBox.innerText = "❌ Not Verified";
            }

        } catch (err) {
            console.error("ERROR:", err);
            resultBox.innerText = "Server not reachable";
        }
    });
});
