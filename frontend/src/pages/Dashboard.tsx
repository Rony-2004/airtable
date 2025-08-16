import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formsAPI } from '../services/api';
import DataViewer from '../components/DataViewer';
import type { Form } from '../types';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingData, setViewingData] = useState<Form | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await formsAPI.getForms();
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formsAPI.deleteForm(id);
        setForms(forms.filter(form => form._id !== id));
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Failed to delete form');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>AF</div>
            <div className={styles.logoText}>FormBuilder</div>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className={styles.userName}>
                {user?.name || 'User'}
              </span>
            </div>
            
            <button onClick={logout} className={styles.logoutBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.dashboardContent}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeHeader}>
            <h1 className={styles.welcomeTitle}>Welcome back, {user?.name || 'User'}!</h1>
            <p className={styles.welcomeSubtitle}>
              Create dynamic forms connected to your Airtable bases. Build forms with conditional logic 
              and collect responses directly into your tables.
            </p>
          </div>
          
          <div className={styles.quickActions}>
            <a href="/form-builder" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              Create New Form
            </a>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statInfo}>
                <h3 className={styles.statNumber}>{forms.length}</h3>
                <p className={styles.statLabel}>Total Forms</p>
              </div>
              <div className={`${styles.statIcon} ${styles.forms}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statInfo}>
                <h3 className={styles.statNumber}>0</h3>
                <p className={styles.statLabel}>Total Responses</p>
              </div>
              <div className={`${styles.statIcon} ${styles.responses}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statInfo}>
                <h3 className={styles.statNumber}>{user?.airtableId ? '1' : '0'}</h3>
                <p className={styles.statLabel}>Connected Accounts</p>
              </div>
              <div className={`${styles.statIcon} ${styles.accounts}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M12,2L14.39,5.42C15.92,7.31 17.11,9.37 18,11.6C19,14.07 19.54,16.72 19.6,19.4L19.6,19.6C19.6,20.37 19.31,21 18.72,21.47C18.14,21.94 17.46,22.16 16.68,22.12C15.91,22.08 15.25,21.8 14.72,21.27C14.18,20.74 13.91,20.09 13.91,19.32C13.91,18.55 14.18,17.9 14.72,17.37C15.25,16.84 15.91,16.56 16.68,16.52C17.46,16.48 18.14,16.7 18.72,17.17C19.31,17.64 19.6,18.27 19.6,19.04L19.6,19.6Z"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section className={styles.formsSection}>
          <div className={styles.formsHeader}>
            <h2 className={styles.formsTitle}>Your Forms</h2>
            <div className={styles.formsActions}>
              <a href="/form-builder" className={`${styles.btn} ${styles.btnSecondary}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                </svg>
                New Form
              </a>
            </div>
          </div>

          <div className={styles.formsContent}>
            {forms.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>No forms yet</h3>
                <p className={styles.emptyDescription}>
                  Create your first form to start collecting responses from your Airtable base.
                </p>
                <a href="/form-builder" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Get Started
                </a>
              </div>
            ) : (
              <div className={styles.formsGrid}>
                {forms.map((form) => (
                  <div key={form._id} className={styles.formCard}>
                    <div className={styles.formCardHeader}>
                      <h3 className={styles.formTitle}>{form.title}</h3>
                      <p className={styles.formDescription}>
                        {form.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div className={styles.formMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Base:</span>
                        <span className={styles.metaValue}>{form.airtableBaseName}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Table:</span>
                        <span className={styles.metaValue}>{form.airtableTableName}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Fields:</span>
                        <span className={styles.metaValue}>{form.fields.length}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Created:</span>
                        <span className={styles.metaValue}>
                          {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.formActions}>
                      <a href={`/form/${form._id}`} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                        </svg>
                        View
                      </a>
                      <button 
                        onClick={() => setViewingData(form)}
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z"/>
                        </svg>
                        View Data
                      </button>
                      <a href={`/form-builder/${form._id}`} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                        </svg>
                        Edit
                      </a>
                      <button 
                        onClick={() => handleDeleteForm(form._id)}
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Data Viewer Modal */}
      {viewingData && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              onClick={() => setViewingData(null)}
              className={styles.closeBtn}
            >
              ✕
            </button>
            <DataViewer form={viewingData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
