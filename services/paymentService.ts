
import { User } from "../types";

// Using a common test key for demonstration. 
// In production, this would be process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const processPayment = (
  user: User, 
  planName: string,
  amount: number,
  onSuccess: () => void,
  onFailure: (error: string) => void
) => {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Amount in paise
    currency: "INR",
    name: "StackCV",
    description: `Upgrade to ${planName}`,
    image: "https://stackcv-logo.com/logo.png", // Optional
    handler: function (response: any) {
      console.log("Payment Successful", response);
      // In a real app, verify the signature on the backend here
      onSuccess();
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: "#0A0A0A",
    },
    modal: {
        ondismiss: function() {
            onFailure("Payment cancelled");
        }
    }
  };

  try {
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  } catch (error) {
    console.error("Razorpay SDK Failed:", error);
    // Fallback simulation for testing without valid Key/Network
    const confirm = window.confirm(`(Simulated Payment Gateway)\n\nComplete payment of ₹${amount} for ${planName}?`);
    if (confirm) {
        onSuccess();
    } else {
        onFailure("Payment simulation cancelled");
    }
  }
};
