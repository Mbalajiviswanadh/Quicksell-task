import React from "react";
import "./Footer.css"; // Create a CSS file for styling if needed

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Created by <strong>Balaji Viswanadh</strong> |{" "}
        <a
          href="https://www.linkedin.com/in/your-linkedin-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin-link">
          LinkedIn
        </a>
      </p>
    </footer>
  );
};

export default Footer;
