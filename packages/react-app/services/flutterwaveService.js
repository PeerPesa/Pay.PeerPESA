import axios from "axios";

export async function initiateFlutterwaveTransfer(amount, phoneNumber, currency) {
    try {
        // Make sure to replace this URL with the correct endpoint for your use case
        const response = await axios.post(
            "https://api.flutterwave.com/v3/charges?type=mobilemoneyuganda", // Adjust endpoint based on the country and currency
            {
                tx_ref: "minipay_transfer_" + Date.now(),
                amount: amount,
                currency: currency,
                payment_type: "mobilemoneyuganda", // Adjust this according to the country-specific payment type
                phone_number: phoneNumber,
                email: "user@example.com", // Replace with user email if required
                redirect_url: "https://your_redirect_url.com", // Replace with your redirect URL
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_FLUTTERWAVE_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Flutterwave transfer failed", error);
        throw new Error("Flutterwave transfer failed");
    }
}
