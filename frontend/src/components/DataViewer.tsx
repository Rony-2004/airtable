import React, { useState, useEffect, useCallback } from 'react';
import { airtableAPI } from '../services/api';
import type { Form } from '../types';
import styles from './DataViewer.module.css';

interface DataViewerProps {
  form: Form;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

const DataViewer: React.FC<DataViewerProps> = ({ form }) => {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await airtableAPI.getRecords(form.airtableBaseId, form.airtableTableId);
      setRecords(response.data.records || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to fetch data from Airtable');
    } finally {
      setLoading(false);
    }
  }, [form.airtableBaseId, form.airtableTableId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const formatFieldValue = (value: unknown): React.ReactNode => {
    if (Array.isArray(value)) {
      // Handle attachments
      if (value.length > 0 && typeof value[0] === 'object' && value[0] && 'url' in value[0]) {
        return (
          <div>
            {value.map((attachment: { url: string; filename?: string }, index: number) => (
              <div key={index} className={styles.attachment}>
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  📎 {attachment.filename || `Attachment ${index + 1}`}
                </a>
              </div>
            ))}
          </div>
        );
      }
      // Handle other arrays
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || '');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Form Submissions from Airtable</h2>
          <p>Loading data from Airtable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Form Submissions from Airtable</h2>
          <p className={styles.error}>{error}</p>
          <button onClick={fetchRecords} className={styles.refreshBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Form Submissions from Airtable</h2>
        <p>Real-time data fetched directly from Airtable's servers</p>
        <button onClick={fetchRecords} className={styles.refreshBtn}>
          🔄 Refresh Data
        </button>
      </div>

      {records.length === 0 ? (
        <div className={styles.noData}>
          <p>No submissions yet. Submit a form to see data appear here!</p>
        </div>
      ) : (
        <div className={styles.dataTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}><strong>Submission Time</strong></div>
            {form.fields.map(field => (
              <div key={field.airtableFieldId} className={styles.tableCell}>
                <strong>{field.questionLabel}</strong>
              </div>
            ))}
          </div>
          
          {records.map(record => (
            <div key={record.id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                {formatDate(record.createdTime)}
              </div>
              {form.fields.map(field => (
                <div key={field.airtableFieldId} className={styles.tableCell}>
                  {formatFieldValue(record.fields[field.airtableFieldName])}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <p>
          <span className={styles.badge}>✅ Live Data</span>
          This data is fetched directly from Airtable's servers, proving the integration works!
        </p>
        <p>
          <small>Base ID: {form.airtableBaseId} | Table ID: {form.airtableTableId}</small>
        </p>
      </div>
    </div>
  );
};

export default DataViewer;
