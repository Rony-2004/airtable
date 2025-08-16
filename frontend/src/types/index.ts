export interface User {
  id: string;
  name: string;
  email: string;
  airtableId: string;
}

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: {
    choices?: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
  };
}

export interface ConditionalLogic {
  dependsOnField: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: any;
}

export interface FormField {
  airtableFieldId: string;
  airtableFieldName: string;
  airtableFieldType: string;
  questionLabel: string;
  isRequired: boolean;
  order: number;
  conditionalLogic?: ConditionalLogic;
  options?: string[];
}

export interface Form {
  _id: string;
  title: string;
  description?: string;
  userId: string;
  airtableBaseId: string;
  airtableTableId: string;
  airtableBaseName: string;
  airtableTableName: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  [fieldId: string]: any;
}
