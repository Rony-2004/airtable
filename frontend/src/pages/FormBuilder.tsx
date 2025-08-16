import React, { useState, useEffect, useCallback } from 'react';
import { airtableAPI, formsAPI } from '../services/api';
import type { AirtableBase, AirtableTable, AirtableField, FormField, Form } from '../types';
import styles from './FormBuilder.module.css';

interface FormBuilderProps {
  formId?: string;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ formId }) => {
  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [tables, setTables] = useState<AirtableTable[]>([]);
  const [fields, setFields] = useState<AirtableField[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    airtableBaseId: '',
    airtableTableId: '',
    airtableBaseName: '',
    airtableTableName: ''
  });
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchForm = useCallback(async () => {
    if (!formId) return;
    try {
      const response = await formsAPI.getForm(formId);
      const form: Form = response.data;
      setFormData({
        title: form.title,
        description: form.description || '',
        airtableBaseId: form.airtableBaseId,
        airtableTableId: form.airtableTableId,
        airtableBaseName: form.airtableBaseName,
        airtableTableName: form.airtableTableName
      });
      setFormFields(form.fields);
      
      // Fetch tables and fields for the existing form
      if (form.airtableBaseId) {
        await fetchTables(form.airtableBaseId);
        if (form.airtableTableId) {
          await fetchFields(form.airtableBaseId, form.airtableTableId);
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      alert('Failed to fetch form');
    }
  }, [formId]);

  useEffect(() => {
    fetchBases();
  }, []);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId, fetchForm]);

  const fetchBases = async () => {
    try {
      setLoading(true);
      const response = await airtableAPI.getBases();
      setBases(response.data.bases || []);
    } catch (error) {
      console.error('Error fetching bases:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to fetch Airtable bases: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (baseId: string) => {
    try {
      const response = await airtableAPI.getTables(baseId);
      setTables(response.data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      alert('Failed to fetch tables');
    }
  };

  const fetchFields = async (baseId: string, tableId: string) => {
    try {
      const response = await airtableAPI.getFields(baseId, tableId);
      setFields(response.data.fields || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
      alert('Failed to fetch fields');
    }
  };

  const handleBaseChange = async (baseId: string) => {
    const selectedBase = bases.find(base => base.id === baseId);
    setFormData(prev => ({
      ...prev,
      airtableBaseId: baseId,
      airtableBaseName: selectedBase?.name || '',
      airtableTableId: '',
      airtableTableName: ''
    }));
    setTables([]);
    setFields([]);
    setFormFields([]);
    
    if (baseId) {
      await fetchTables(baseId);
    }
  };

  const handleTableChange = async (tableId: string) => {
    const selectedTable = tables.find(table => table.id === tableId);
    setFormData(prev => ({
      ...prev,
      airtableTableId: tableId,
      airtableTableName: selectedTable?.name || ''
    }));
    setFields([]);
    setFormFields([]);
    
    if (formData.airtableBaseId && tableId) {
      await fetchFields(formData.airtableBaseId, tableId);
    }
  };

  const addField = (field: AirtableField) => {
    const newFormField: FormField = {
      airtableFieldId: field.id,
      airtableFieldName: field.name,
      airtableFieldType: field.type,
      questionLabel: field.name,
      isRequired: false,
      order: formFields.length,
      options: field.options?.choices?.map(choice => choice.name) || []
    };
    setFormFields([...formFields, newFormField]);
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFormFields(formFields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const testConnection = async () => {
    try {
      console.log('Testing Airtable connection...');
      
      // Test user info
      const userResponse = await airtableAPI.getUser();
      console.log('User info:', userResponse.data);
      
      // Test bases
      const basesResponse = await airtableAPI.getBases();
      console.log('Bases response:', basesResponse.data);
      
      alert(`Connection successful!\nUser: ${userResponse.data.email || 'Unknown'}\nBases found: ${basesResponse.data.bases?.length || 0}\n\nCheck console for details.`);
    } catch (error) {
      console.error('Connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Connection test failed: ${errorMessage}\n\nCheck console for details.`);
    }
  };

  const saveForm = async () => {
    if (!formData.title || !formData.airtableBaseId || !formData.airtableTableId || formFields.length === 0) {
      alert('Please fill in all required fields and add at least one form field');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        fields: formFields
      };

      if (formId) {
        await formsAPI.updateForm(formId, payload);
        alert('Form updated successfully!');
      } else {
        await formsAPI.createForm(payload);
        alert('Form created successfully!');
      }
      
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Loading your Airtable data...
      </div>
    );
  }

  return (
    <div className={styles.formBuilder}>
      <header className={styles.formBuilderHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <button 
              onClick={() => window.history.back()} 
              className={styles.backButton}
              title="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
            </button>
            <h1>{formId ? 'Edit Form' : 'Create New Form'}</h1>
          </div>
          <div className={styles.headerActions}>
            <button 
              onClick={saveForm} 
              disabled={saving || !formData.title || !formData.airtableBaseId || !formData.airtableTableId}
              className={`${styles.btn} ${styles.btnSuccess}`}
            >
              {saving ? (
                <>
                  <div className={styles.spinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                  </svg>
                  Save Form
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.formBuilderContent}>
        <div className={styles.leftSidebar}>
          {/* Form Settings */}
          <div className={styles.formSettings}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Form Settings</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Form Title *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter form title"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Enter form description (optional)"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="base-select">Airtable Base * ({bases.length} available)</label>
                <select
                  id="base-select"
                  className={styles.formSelect}
                  value={formData.airtableBaseId}
                  onChange={(e) => handleBaseChange(e.target.value)}
                >
                  <option value="">Select a base</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
                </select>
                {bases.length === 0 && !loading && (
                  <div className={styles.errorMessage}>
                    <p><strong>No Airtable bases found.</strong></p>
                    <p>Please:</p>
                    <ul className={styles.helpList}>
                      <li>Create a base in your <a href="https://airtable.com" target="_blank" rel="noopener noreferrer" className={styles.helpLink}>Airtable account</a></li>
                      <li>Or check if you're logged into the correct Airtable account</li>
                      <li>Try logging out and logging back in</li>
                    </ul>
                    <button 
                      onClick={testConnection}
                      className={`${styles.btn} ${styles.btnSecondary} ${styles.testButton}`}
                    >
                      Test Connection
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="table-select">Airtable Table *</label>
                <select
                  id="table-select"
                  className={styles.formSelect}
                  value={formData.airtableTableId}
                  onChange={(e) => handleTableChange(e.target.value)}
                  disabled={!formData.airtableBaseId}
                >
                  <option value="">Select a table</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>{table.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Available Fields */}
          {fields.length > 0 && (
            <div className={styles.availableFields}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Available Fields</h2>
              </div>
              <div className={styles.fieldsContent}>
                <div className={styles.fieldsList}>
                  {fields.filter(field => !formFields.find(ff => ff.airtableFieldId === field.id)).map(field => (
                    <div key={field.id} className={styles.fieldItem}>
                      <div className={styles.fieldInfo}>
                        <div className={styles.fieldName}>{field.name}</div>
                        <div className={styles.fieldType}>{field.type}</div>
                      </div>
                      <button 
                        onClick={() => addField(field)}
                        className={styles.addFieldBtn}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>

                {fields.filter(field => !formFields.find(ff => ff.airtableFieldId === field.id)).length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                      </svg>
                    </div>
                    <div className={styles.emptyTitle}>All fields added!</div>
                    <div className={styles.emptyDescription}>You've added all available fields to your form.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightContent}>
          {/* Form Preview */}
          <div className={styles.formPreview}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Form Fields ({formFields.length})</h2>
            </div>
            <div className={styles.previewContent}>
              {formFields.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                  </div>
                  <div className={styles.emptyTitle}>No fields selected</div>
                  <div className={styles.emptyDescription}>Select fields from the available fields section to build your form.</div>
                </div>
              ) : (
                <div className={styles.formFields}>
                  {formFields.map((field, index) => (
                    <div key={index} className={styles.formFieldItem}>
                      <div className={styles.fieldHeader}>
                        <span className={styles.fieldTitle}>{field.questionLabel}</span>
                        <div className={styles.fieldActions}>
                          <button
                            onClick={() => removeField(index)}
                            className={`${styles.fieldActionBtn} ${styles.danger}`}
                            title="Remove field"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.fieldInputGroup}>
                        <label className={styles.formLabel}>Question Label</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          value={field.questionLabel}
                          onChange={(e) => updateField(index, { questionLabel: e.target.value })}
                          placeholder="Enter question label"
                        />
                      </div>

                      <div className={styles.fieldOptions}>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(e) => updateField(index, { isRequired: e.target.checked })}
                            aria-label="Mark field as required"
                          />
                          <span>Required field</span>
                        </label>

                        {/* Conditional Logic Section */}
                        <div className={styles.conditionalLogic}>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={!!field.conditionalLogic}
                              onChange={(e) => updateField(index, {
                                conditionalLogic: e.target.checked ? {
                                  dependsOnField: '',
                                  condition: 'equals' as const,
                                  value: ''
                                } : undefined
                              })}
                              aria-label="Enable conditional logic"
                            />
                            <span>Show only when conditions are met</span>
                          </label>

                          {field.conditionalLogic && (
                            <div className={styles.conditionalOptions}>
                              <div className={styles.fieldInputGroup}>
                                <label className={styles.formLabel}>Show this field when:</label>
                                <select
                                  className={styles.fieldInput}
                                  value={field.conditionalLogic.dependsOnField || ''}
                                  onChange={(e) => updateField(index, {
                                    conditionalLogic: {
                                      dependsOnField: e.target.value,
                                      condition: field.conditionalLogic?.condition || 'equals',
                                      value: field.conditionalLogic?.value || ''
                                    }
                                  })}
                                  title="Select a field to depend on"
                                >
                                  <option value="">Select a field...</option>
                                  {formFields
                                    .filter((_, i) => i !== index) // Don't show current field
                                    .map((f, i) => (
                                      <option key={i} value={f.airtableFieldId}>
                                        {f.questionLabel}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              {field.conditionalLogic.dependsOnField && (
                                <>
                                  <div className={styles.fieldInputGroup}>
                                    <label className={styles.formLabel}>Condition:</label>
                                    <select
                                      className={styles.fieldInput}
                                      value={field.conditionalLogic.condition}
                                      onChange={(e) => updateField(index, {
                                        conditionalLogic: {
                                          dependsOnField: field.conditionalLogic?.dependsOnField || '',
                                          condition: e.target.value as 'equals' | 'not_equals' | 'contains' | 'not_contains',
                                          value: field.conditionalLogic?.value || ''
                                        }
                                      })}
                                      title="Select condition type"
                                    >
                                      <option value="equals">Equals</option>
                                      <option value="not_equals">Does not equal</option>
                                      <option value="contains">Contains</option>
                                      <option value="not_contains">Does not contain</option>
                                    </select>
                                  </div>

                                  <div className={styles.fieldInputGroup}>
                                    <label className={styles.formLabel}>Value:</label>
                                    <input
                                      type="text"
                                      className={styles.fieldInput}
                                      value={field.conditionalLogic.value || ''}
                                      onChange={(e) => updateField(index, {
                                        conditionalLogic: {
                                          dependsOnField: field.conditionalLogic?.dependsOnField || '',
                                          condition: field.conditionalLogic?.condition || 'equals',
                                          value: e.target.value
                                        }
                                      })}
                                      placeholder="Enter the value that will trigger this field to show (e.g., Completed, In Progress, Failed)"
                                    />
                                    <small className={styles.fieldHint}>
                                      Enter the value that will trigger this field to show
                                    </small>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={styles.fieldType}>
                          {field.airtableFieldType}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
