import React, { useState, useEffect, useCallback } from 'react';
import { formsAPI, airtableAPI } from '../services/api';
import { uploadFiles, type AttachmentFile } from '../services/uploadService';
import type { Form, FormField, FormResponse } from '../types';
import styles from './FormViewer.module.css';

interface FormViewerProps {
  formId: string;
}

const FormViewer: React.FC<FormViewerProps> = ({ formId }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse>({});
  const [visibleFields, setVisibleFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchForm = useCallback(async () => {
    try {
      const response = await formsAPI.getForm(formId);
      setForm(response.data);
    } catch (error) {
      console.error('Error fetching form:', error);
      alert('Form not found');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  const updateVisibleFields = useCallback(() => {
    if (!form) return;

    console.log('Updating visible fields...');
    console.log('Current responses:', responses);
    console.log('Form fields:', form.fields);

    const visible = form.fields.filter(field => {
      console.log(`Checking field: ${field.questionLabel} (${field.airtableFieldId})`);
      
      if (!field.conditionalLogic) {
        console.log(`  - No conditional logic, showing field`);
        return true;
      }

      console.log(`  - Has conditional logic:`, field.conditionalLogic);
      
      const dependentValue = responses[field.conditionalLogic.dependsOnField];
      const conditionValue = field.conditionalLogic.value;
      
      console.log(`  - Dependent value (${field.conditionalLogic.dependsOnField}):`, dependentValue);
      console.log(`  - Condition value:`, conditionValue);
      console.log(`  - Condition type:`, field.conditionalLogic.condition);

      let shouldShow = false;
      switch (field.conditionalLogic.condition) {
        case 'equals':
          shouldShow = dependentValue === conditionValue;
          break;
        case 'not_equals':
          shouldShow = dependentValue !== conditionValue;
          break;
        case 'contains':
          shouldShow = dependentValue && dependentValue.toString().includes(conditionValue);
          break;
        case 'not_contains':
          shouldShow = !dependentValue || !dependentValue.toString().includes(conditionValue);
          break;
        default:
          shouldShow = true;
      }
      
      console.log(`  - Should show field:`, shouldShow);
      return shouldShow;
    });

    console.log('Visible fields:', visible.map(f => f.questionLabel));
    setVisibleFields(visible);
  }, [form, responses]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  useEffect(() => {
    if (form) {
      updateVisibleFields();
    }
  }, [form, responses, updateVisibleFields]);

  const handleInputChange = (fieldId: string, value: string | string[] | File[]) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    visibleFields.forEach(field => {
      if (field.isRequired && !responses[field.airtableFieldId]) {
        newErrors[field.airtableFieldId] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Form submission started...');

      // Transform responses to Airtable format
      const airtableFields: Record<string, string | string[] | { url: string; filename: string }[]> = {};
      
      // Process each field
      for (const field of visibleFields) {
        const value = responses[field.airtableFieldId];
        if (value !== undefined && value !== '') {
          
          // Handle file uploads
          if (field.airtableFieldType === 'multipleAttachments' && Array.isArray(value) && value.length > 0) {
            try {
              console.log('Uploading files for field:', field.airtableFieldName);
              const uploadedFiles = await uploadFiles(value as File[]);
              
              // Format for Airtable attachments
              airtableFields[field.airtableFieldName] = uploadedFiles.map(file => ({
                url: file.url,
                filename: file.filename
              }));
              
              console.log('Files uploaded successfully:', uploadedFiles);
            } catch (uploadError) {
              console.error('File upload failed:', uploadError);
              alert(`File upload failed for ${field.questionLabel}: ${uploadError}`);
              setSubmitting(false);
              return;
            }
          } else if (field.airtableFieldType !== 'multipleAttachments') {
            // Handle other field types
            airtableFields[field.airtableFieldName] = value;
          }
        }
      }

      console.log('Airtable fields to submit:', airtableFields);

      await airtableAPI.createRecord(form!.airtableBaseId, form!.airtableTableId, airtableFields);
      
      alert('Form submitted successfully!');
      setResponses({});
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Type-safe error handling
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Check if it's an axios error with response
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }, status?: number } };
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      alert(`Failed to submit form: ${errorMessage}\n\nCheck console for details.`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.airtableFieldId] || '';
    const hasError = errors[field.airtableFieldId];

    switch (field.airtableFieldType) {
      case 'singleLineText':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className={`${styles.formInput} ${hasError ? styles.error : ''}`}
            placeholder={`Enter ${field.questionLabel}`}
          />
        );

      case 'multilineText':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className={`${styles.formTextarea} ${hasError ? styles.error : ''}`}
            placeholder={`Enter ${field.questionLabel}`}
            rows={4}
          />
        );

      case 'singleSelect':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className={`${styles.formSelect} ${hasError ? styles.error : ''}`}
            aria-label={field.questionLabel}
          >
            <option value="">Select an option</option>
            {field.options && field.options.length > 0 ? (
              field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))
            ) : (
              // Default Status options if no options are saved
              field.questionLabel.toLowerCase().includes('status') ? [
                'Planned', 'In Progress', 'Completed', 'Blocked', 'Cancelled'
              ].map(option => (
                <option key={option} value={option}>{option}</option>
              )) : null
            )}
          </select>
        );

      case 'multipleSelects':
        return (
          <div className={styles.checkboxGroup}>
            {field.options?.map(option => (
              <label key={option} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange(field.airtableFieldId, [...currentValues, option]);
                    } else {
                      handleInputChange(field.airtableFieldId, currentValues.filter(v => v !== option));
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multipleAttachments':
        return (
          <div className={styles.fileInput}>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleInputChange(field.airtableFieldId, files);
              }}
              className={hasError ? styles.error : ''}
              aria-label={`Upload files for ${field.questionLabel}`}
            />
            <p>Choose files or drag and drop</p>
            <small className={styles.fileUploadInfo}>
              Supported formats: JPG, PNG, GIF, PDF, DOC, TXT (max 10MB each)
            </small>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className={`${styles.formInput} ${hasError ? styles.error : ''}`}
            placeholder={`Enter ${field.questionLabel}`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <div className={styles.formViewer}>
        <div className={styles.formContainer}>
          <div className={styles.formNotFound}>
            <div className={styles.notFoundIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
              </svg>
            </div>
            <h2 className={styles.notFoundTitle}>Form not found</h2>
            <p className={styles.notFoundDescription}>The form you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formViewer}>
      <div className={styles.formContainer}>
        <header className={styles.formHeader}>
          <h1 className={styles.formTitle}>{form.title}</h1>
          {form.description && <p className={styles.formDescription}>{form.description}</p>}
        </header>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          {visibleFields.map((field) => (
            <div key={field.airtableFieldId} className={styles.formField}>
              <label className={styles.fieldLabel}>
                {field.questionLabel}
                {field.isRequired && <span className={styles.required}>*</span>}
              </label>
              
              {renderField(field)}
              
              {errors[field.airtableFieldId] && (
                <span className={styles.errorMessage}>{errors[field.airtableFieldId]}</span>
              )}
            </div>
          ))}

          {visibleFields.length === 0 && (
            <div className={styles.noFields}>
              <div className={styles.noFieldsIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                </svg>
              </div>
              <div className={styles.noFieldsTitle}>No fields available</div>
              <div className={styles.noFieldsDescription}>
                No fields are currently visible based on the form logic.
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button 
              type="submit" 
              disabled={submitting || visibleFields.length === 0}
              className={styles.submitButton}
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormViewer;
