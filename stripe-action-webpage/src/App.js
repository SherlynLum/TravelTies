import React, {useState, useEffect} from "react";
import "./styles.css"

const StripePages = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [buttonName, setButtonName] = useState("");

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (state === "refresh") {
      setTitle("Stripe onboarding incomplete");
      setMessage("Please go back to TravelTies and re-tap");
      setButtonName(`"Connect with Stripe"`)
    } else if (state === "complete") {
      setTitle("Stripe onboarding complete");
      setMessage("Please go back to TravelTies and tap");
      setButtonName(`"I've completed onboarding in Stripe"`)
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
        {message} <strong>{buttonName}</strong>
      </p>
    </div>
  )
}

export default StripePages