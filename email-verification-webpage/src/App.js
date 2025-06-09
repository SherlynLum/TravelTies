import React, {useState, useEffect} from "react";
import {applyActionCode, getAuth} from "firebase/auth";
import {app} from "./firebaseConfig.ts";
import "./styles.css";
import successIcon from "./assets/success.png";
import failIcon from "./assets/failure.png";

const EmailVerificationPage = () => {
  const [text, setText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const oobCode = new URLSearchParams(window.location.search).get("oobCode");

    if (!oobCode) {
      setText("The email verification link is invalid.");
      setInstruction("Please check your email again or request to resend a verification email.")
      setSuccess(false);
      return;
    }

    const auth = getAuth(app);
    applyActionCode(auth, oobCode).then(() => {
      setText("You have successfully verified your email.");
      setInstruction("You can now return to TravelTies:)");
      setSuccess(true);
    }).catch((e) => {
      setText("Email verification failed: " + e.message);
      setInstruction("Please check your email again or request to resend a verification email.")
      setSuccess(false);
    })
  }, [])

  return (
    <div className="mainContainer">
      <img src={success ? successIcon : failIcon} alt="" 
      style={{width: "clamp(80px, 25vw, 120px)", height: "auto", marginBottom: "1.5rem"}}/>
      <h3 style={{fontSize: "clamp(1rem, 5vw, 1.5rem)", lineHeight: "1.7", width: "100%",
        margin: "1rem"}}>
        {text}
      </h3>
      <h3 style={{fontSize: "clamp(1rem, 5vw, 1.5rem)", lineHeight: "1.7", width: "100%", 
        margin: "1rem"}}>
        {instruction}
      </h3>
    </div>
  )
}

export default EmailVerificationPage