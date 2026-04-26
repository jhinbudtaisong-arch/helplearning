import React from "react";
import ReactDOM from "react-dom/client";
import RecoveredCatStudyLogin from "./cat_study_login.jsx";
import "./styles.css";

if (typeof window !== "undefined" && window.__CAT_STUDY_DESKTOP__?.isDesktopShell) {
  document.documentElement.classList.add("cat-study-desktop");
  document.body.classList.add("cat-study-desktop");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecoveredCatStudyLogin />
  </React.StrictMode>
);
