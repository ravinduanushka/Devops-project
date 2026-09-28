function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        {/* Left Column: Clinic Us */}
        <div className="footer-col footer-col-left">
          <h3 className="footer-heading">Clinic Us</h3>
          <p className="footer-address">
            370 Main Road<br />
            Galle SriLanka
          </p>
          <div className="footer-contact-item">
            <span className="footer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <a href="tel:0919118207" className="footer-link">091-9118207</a>
          </div>
          <div className="footer-contact-item">
            <span className="footer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <a href="mailto:nexushealthgov@gmail.com" className="footer-link">nexushealthgov@gmail.com</a>
          </div>
        </div>

        {/* Right Column: Support */}
        <div className="footer-col footer-col-right">
          <h3 className="footer-heading">Support</h3>
          <p className="footer-copyright">
            &copy; 2026 NEXUSHEALTH . All rights reserved.
          </p>
          <div className="footer-support-contacts">
            <span className="footer-icon-inline">📧</span>
            <a href="mailto:info@nexushealth.com" className="footer-link">info@nexushealth.com</a>
            <span className="footer-divider">|</span>
            <span className="footer-icon-inline">📞</span>
            <a href="tel:+94771234567" className="footer-link">+94 77 123 4567</a>
          </div>

          {/* Social Plugins requested by user */}
          <div className="footer-social-plugins">
            <span className="social-label">Connect with us:</span>
            <div className="social-buttons">
              {/* Facebook Plugin */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn facebook-btn"
                title="Follow us on Facebook"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span>Facebook</span>
              </a>

              {/* YouTube Plugin */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn youtube-btn"
                title="Watch on YouTube"
                aria-label="YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.53l5.72 3.25-5.72 3.24z"/>
                </svg>
                <span>YouTube</span>
              </a>

              {/* Google Plugin */}
              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn google-btn"
                title="Find us on Google"
                aria-label="Google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93c-3.13-.47-5.5-3.17-5.5-6.43 0-3.59 2.91-6.5 6.5-6.5 1.63 0 3.12.61 4.26 1.62l-1.5 1.5C14.07 7.47 13.09 7 12 7c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16c2.09 0 3.86-1.42 4.34-3.35H12V10.5h6.63c.09.52.14 1.05.14 1.6 0 3.92-2.63 6.71-6.77 6.83z"/>
                </svg>
                <span>Google</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
