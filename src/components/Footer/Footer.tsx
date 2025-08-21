import React from 'react';
import { Github, Twitter, Globe } from 'lucide-react';
import './Footer.scss';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <img src="/stellaris-icon.png" alt="Stellaris Logo" className="footer-logo" />
              <div>
                <h3 className="footer-title">Stellaris Explorer</h3>
                <p className="footer-description">
                  The official blockchain explorer for the Stellaris network
                </p>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Network</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Mainnet</a></li>
              <li><a href="#" className="footer-link">Testnet</a></li>
              <li><a href="#" className="footer-link">API Docs</a></li>
              <li><a href="#" className="footer-link">Status</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Documentation</a></li>
              <li><a href="#" className="footer-link">Developer Guide</a></li>
              <li><a href="#" className="footer-link">White Paper</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Community</h4>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Website">
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Stellaris Chain. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">Privacy Policy</a>
              <a href="#" className="footer-bottom-link">Terms of Service</a>
              <a href="#" className="footer-bottom-link">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
