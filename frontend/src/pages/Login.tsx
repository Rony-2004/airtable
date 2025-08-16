import React from 'react';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const handleAirtableLogin = () => {
    window.location.href = 'http://localhost:5000/auth/airtable';
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <h1 className={styles.loginTitle}>Form Builder</h1>
          <p className={styles.loginSubtitle}>
            Create dynamic forms with Airtable integration
          </p>
        </div>

        <p className={styles.loginDescription}>
          Connect your Airtable account to start building beautiful forms that save responses 
          directly to your bases with conditional logic and custom validation.
        </p>

        <button
          onClick={handleAirtableLogin}
          className={styles.loginButton}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          Connect with Airtable
        </button>

        <div className={styles.features}>
          <h3 className={styles.featuresTitle}>What you'll get:</h3>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#22543d">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              Dynamic form creation from Airtable fields
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#22543d">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              Conditional logic for smart forms
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#22543d">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              Automatic response saving to Airtable
            </li>
            <li className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#22543d">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              Beautiful, responsive form design
            </li>
          </ul>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Secure OAuth connection • No data stored locally
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
