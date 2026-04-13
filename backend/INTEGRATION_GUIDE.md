# Integration Guide - MERN Document Submission System

This guide explains how to connect this frontend to your backend services (MongoDB, Express, email service, etc.).

## Overview

The current frontend includes mock API endpoints. To make it fully functional, you need to:

1. Set up a Node.js/Express backend (or connect to existing backend)
2. Configure MongoDB with GridFS for file storage
3. Set up email service (SMTP, SendGrid, AWS SES, etc.)
4. Implement authentication and authorization
5. Deploy everything together

## Step 1: Backend Setup

### Option A: Node.js/Express Backend

Create a new Express app with the following endpoints:

```javascript
// Required endpoints
POST   /api/submissions           // Create new submission
GET    /api/submissions           // List all submissions (admin)
GET    /api/submissions/:id       // Get submission details (admin)
PUT    /api/submissions/:id       // Update submission status (admin)
DELETE /api/submissions/:id       // Delete submission (admin)
GET    /api/submissions/:id/download  // Download submission files (admin)
```

### Option B: Spring Boot Backend

If using your original Spring Boot architecture:
- Ensure endpoints match the structure above
- Configure GridFS for MongoDB
- Set up JavaMail for email notifications

### Option C: Use a BaaS (Backend as a Service)

- Supabase (PostgreSQL)
- Firebase (Realtime Database/Firestore)
- AWS Amplify
- MongoDB Realm

## Step 2: Database Setup

### MongoDB Configuration

```javascript
// Required collections
submissions {
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  notes: string,
  status: "pending" | "approved" | "rejected",
  documents: {
    identity: { fileId: ObjectId, uploadedAt: Date },
    drivingLicense: { fileId: ObjectId, uploadedAt: Date },
    photo: { fileId: ObjectId, uploadedAt: Date },
    bankDetails: { fileId: ObjectId, uploadedAt: Date },
    medicalCert: { fileId: ObjectId, uploadedAt: Date },
    infoForm: { fileId: ObjectId, uploadedAt: Date }
  },
  createdAt: Date,
  updatedAt: Date,
  reviewedBy: string (admin username),
  reviewNotes: string
}

// GridFS buckets for file storage
fs.files
fs.chunks
```

### Database Indexes

```javascript
db.submissions.createIndex({ email: 1 })
db.submissions.createIndex({ status: 1 })
db.submissions.createIndex({ createdAt: -1 })
db.submissions.createIndex({ "documents.identity.uploadedAt": 1 })
```

## Step 3: Email Service Setup

### SMTP Configuration (Gmail)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
COMPANY_EMAIL=admin@company.com
```

1. Generate app password: https://myaccount.google.com/apppasswords
2. Update `.env` with credentials

### SendGrid

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@company.com
COMPANY_EMAIL=admin@company.com
```

### AWS SES

```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
EMAIL_FROM=noreply@company.com
COMPANY_EMAIL=admin@company.com
```

## Step 4: API Integration in Frontend

### Update API Endpoints

In `/app/api/submissions/route.ts`, replace the mock implementation:

```typescript
// Original mock - REPLACE WITH ACTUAL BACKEND CALL
const response = await fetch('http://localhost:3001/api/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submission),
});
```

### Connect to Express Backend

```typescript
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward to Express backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/submissions`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Include auth token if needed
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error submitting documents' },
      { status: 500 }
    );
  }
}
```

## Step 5: Authentication

### Add JWT Authentication

1. Update environment variables:
```env
JWT_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

2. Add auth middleware:
```typescript
// lib/auth.ts
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (err) {
    return null;
  }
}
```

3. Protect admin routes:
```typescript
// app/api/submissions/route.ts
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const payload = await verifyAuth(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json(
      { message: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Continue with admin functionality
}
```

## Step 6: Environment Variables

Create `.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/documents
DATABASE_NAME=documents

# Email
EMAIL_FROM=noreply@company.com
COMPANY_EMAIL=admin@company.com

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_JWT_EXPIRY=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=hashed-password
```

## Step 7: Deployment

### Deploy Frontend (Next.js)

```bash
# Vercel
vercel deploy

# or Docker
docker build -t doc-submission-frontend .
docker run -p 3000:3000 doc-submission-frontend
```

### Deploy Backend (Express)

```bash
# Heroku
git push heroku main

# or Docker
docker build -t doc-submission-backend .
docker run -p 3001:3001 doc-submission-backend

# or Node on VPS
npm install
npm run build
npm start
```

### Production Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Set secure JWT_SECRET in production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Configure email service with production credentials
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Set up CDN for static files
- [ ] Configure file cleanup (old submissions)

## Testing the Integration

### Manual Testing

1. Start backend:
```bash
cd backend
npm run dev
```

2. Start frontend:
```bash
cd frontend
npm run dev
```

3. Test submission flow:
   - Go to http://localhost:3000/submit
   - Fill form and upload documents
   - Check backend logs for POST request
   - Verify files in MongoDB
   - Check email sent to company inbox

### Automated Testing

```bash
# Run frontend tests
npm run test

# Run backend tests
cd backend && npm run test
```

## Troubleshooting

### Connection Issues

```
Error: Failed to fetch from backend
```

- Check backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS headers in backend

### File Upload Issues

```
Error: File size exceeds limit
```

- Increase file size limit in backend
- Check `MAX_FILE_SIZE` in `lib/config.ts`

### Email Issues

```
Error: SMTP connection failed
```

- Verify email credentials
- Check firewall/network access to SMTP server
- Enable less secure apps (Gmail)
- Check email service status

### Database Issues

```
Error: MongoDB connection timeout
```

- Verify MongoDB URI
- Check network access to MongoDB
- Ensure MongoDB service is running
- Check database user permissions

## API Response Format

### Success Response

```json
{
  "id": "SUB-1234567890",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "status": "pending",
  "createdAt": "2024-03-24T10:30:00Z",
  "documents": {
    "identity": true,
    "drivingLicense": true,
    "photo": true,
    "bankDetails": true,
    "medicalCert": false,
    "infoForm": true
  }
}
```

### Error Response

```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Next Steps

1. Set up your backend following the API specifications
2. Configure MongoDB with proper indexes
3. Set up email service with templates
4. Add authentication/authorization
5. Deploy to production
6. Monitor submissions and system health
7. Gather user feedback and iterate

For more information, see the main README.md file.
