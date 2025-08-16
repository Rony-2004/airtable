# Airtable Form Builder

A full-stack MERN application that allows users to create dynamic forms connected to their Airtable bases. Users can log in with Airtable OAuth, build forms using their table fields, apply conditional logic, and automatically save responses to Airtable.

## Features

### Core Features
- ✅ **Airtable OAuth Integration** - Secure login with Airtable account
- ✅ **Dynamic Form Builder** - Create forms using fields from Airtable tables
- ✅ **Conditional Logic** - Show/hide fields based on previous answers
- ✅ **Supported Field Types**:
  - Short text (singleLineText)
  - Long text (multilineText) 
  - Single select (singleSelect)
  - Multi select (multipleSelects)
  - File upload (multipleAttachments)
- ✅ **Form Responses** - Automatically save responses to Airtable
- ✅ **Form Management** - Create, edit, delete, and view forms

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, CSS Modules
- **Backend**: Node.js, Express, MongoDB, JWT
- **Integration**: Airtable REST API, OAuth 2.0
- **Database**: MongoDB with Mongoose

## Setup Instructions

### Prerequisites
- Node.js (v20.17.0 or higher)
- MongoDB (local or cloud instance)
- Airtable account and OAuth app

### 1. Clone the Repository
```bash
git clone <repository-url>
cd airtable-form-builder
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/airtable-form-builder
PORT=5000
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# Airtable OAuth Configuration
AIRTABLE_CLIENT_ID=your-airtable-client-id
AIRTABLE_CLIENT_SECRET=your-airtable-client-secret
AIRTABLE_REDIRECT_URI=http://localhost:5000/auth/airtable/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

## Airtable OAuth App Setup

1. **Create Airtable OAuth App**:
   - Go to [Airtable Developer Portal](https://airtable.com/developers/apps)
   - Click "Create new app"
   - Choose "OAuth integration"

2. **Configure OAuth Settings**:
   - **App name**: Your app name
   - **Redirect URLs**: `http://localhost:5000/auth/airtable/callback`
   - **Scopes**: 
     - `data.records:read`
     - `data.records:write` 
     - `data.schema:read`

3. **Get Credentials**:
   - Copy the **Client ID** and **Client Secret**
   - Add them to your backend `.env` file

4. **Test OAuth Flow**:
   - Start both backend and frontend servers
   - Navigate to `http://localhost:5173`
   - Click "Login with Airtable"

## Application Architecture

### Backend Structure
```
backend/
├── models/
│   ├── User.js          # User model with Airtable tokens
│   └── Form.js          # Form configuration model
├── routes/
│   ├── auth.js          # OAuth authentication routes
│   ├── airtable.js      # Airtable API integration
│   └── forms.js         # Form CRUD operations
├── middleware/
│   └── auth.js          # JWT authentication middleware
└── server.js            # Express server setup
```

### Frontend Structure
```
frontend/src/
├── components/          # Reusable UI components
├── pages/
│   ├── Login.tsx        # OAuth login page
│   ├── Dashboard.tsx    # Form management dashboard
│   ├── FormBuilder.tsx  # Form creation/editing
│   └── FormViewer.tsx   # Public form filling
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── services/
│   └── api.ts          # API service layer
└── types/
    └── index.ts        # TypeScript type definitions
```

## API Endpoints

### Authentication
- `GET /auth/airtable` - Initiate OAuth flow
- `GET /auth/airtable/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

### Airtable Integration
- `GET /api/airtable/bases` - Get user's bases
- `GET /api/airtable/bases/:baseId/tables` - Get base tables
- `GET /api/airtable/bases/:baseId/tables/:tableId/fields` - Get table fields
- `POST /api/airtable/bases/:baseId/tables/:tableId/records` - Create record

### Forms
- `POST /api/forms` - Create form
- `GET /api/forms` - Get user's forms
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

## Conditional Logic

The application supports conditional field visibility based on previous answers:

### Supported Conditions
- **equals**: Show field if previous answer equals specific value
- **not_equals**: Show field if previous answer doesn't equal value
- **contains**: Show field if previous answer contains text
- **not_contains**: Show field if previous answer doesn't contain text

### Example
```javascript
{
  dependsOnField: "field_role",
  condition: "equals", 
  value: "Engineer"
}
```
This will show the field only when the "Role" field equals "Engineer".

## Form Builder Workflow

1. **Select Base & Table**: Choose which Airtable base and table to connect
2. **Add Fields**: Click on available fields to add them to your form
3. **Customize Questions**: Rename field labels and mark as required
4. **Apply Logic**: Set conditional visibility rules (optional)
5. **Save Form**: Form is ready for sharing and collecting responses

## Form Submission Process

1. **Dynamic Rendering**: Form fields appear/hide based on conditional logic
2. **Validation**: Required fields are validated before submission
3. **Airtable Integration**: Responses are automatically saved as new records
4. **Field Mapping**: Form fields map back to original Airtable field names

## Development

### Running in Development

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend  
npm run dev
```

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Screenshots

### Login Page
Clean OAuth login interface with Airtable branding.

### Dashboard
Overview of all created forms with management options.

### Form Builder
Drag-and-drop interface for building forms from Airtable fields.

### Form Viewer
Clean, responsive form interface for end users.

## Troubleshooting

### Common Issues

1. **OAuth Error**: Verify redirect URL matches exactly in Airtable app settings
2. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
3. **CORS Issues**: Check frontend URL is whitelisted in backend CORS settings
4. **Field Types**: Only supported Airtable field types will appear in form builder

### Debug Mode
Set `NODE_ENV=development` for detailed error logging.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
