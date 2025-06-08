import React, {useState, useEffect} from "react";
import {getAuth} from "firebase/auth";
import {app} from "./firebaseConfig.ts";
import successIcon from "./assets/success.png";
import failIcon from "./assets/failure.png";

const EmailVerificationPage = () => {
  const [icon, setIcon] = useState(undefined);
  const [text, setText] = useState(undefined);
  const [success, setSuccess] = useState(undefined);

  useEffect(() => {
    const oobCode = new URLSearchParams(window.location.search).get("oobCode");

    if (!oobCode) {
      setText("Oops! The email verification link is invalid."
        + "\nPlease check your email again or request to resend a verification email.")
    }

    const auth = getAuth(app);
  })
}

export default EmailVerificationPage