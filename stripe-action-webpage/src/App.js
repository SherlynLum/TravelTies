import React, {useState, useEffect} from "react";
import "./styles.css"

const StripePages = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [buttonName, setButtonName] = useState("");

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (state === "refresh-onboard") {
      setTitle("Stripe onboarding incomplete");
      setMessage("Please go back to TravelTies and re-tap");
      setButtonName(`"Connect with Stripe"`)
    } else if (state === "complete-onboard") {
      setTitle("Stripe onboarding complete");
      setMessage("Please go back to TravelTies and tap");
      setButtonName(`"I've completed onboarding in Stripe"`)
    } else if (state === "refresh-update") {
      setTitle("Updated Stripe details not saved");
      setMessage("To edit your Stripe details again, please go back to TravelTies and re-tap");
      setButtonName(`"Open Stripe"`)
    } else if (state === "complete-update") {
      setTitle("Successfully updated Stripe details");
      setMessage("Feel free to go back to TravelTies");
      setButtonName("");
    }
  }, []);

  return (
    <div className="mainContainer" style={{textAlign: "center"}}>
      <h3 style={{fontSize: "clamp(1rem, 5vw, 1.5rem)", lineHeight: "1.7", width: "100%",
        margin: "1rem"}}>
        {title}
      </h3>
      <p style={{fontSize: "clamp(1rem, 4vw, 1.2rem)", lineHeight: "1.7", width: "100%", 
        margin: "1rem"}}>
        {message} {buttonName && <strong>{buttonName}</strong>}
      </p>
    </div>
  )
}

export default StripePages