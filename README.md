# File Sharing System

A secure and efficient file sharing system built with React for the frontend and Node.js for the backend. Share files easily with role-based access control, real-time updates, and secure storage.

## 🚀 Features

- **Secure File Upload & Storage**: End-to-end encryption for file transfers
- **User Management**: Role-based access control (Admin, Manager, User)
- **File Organization**: Create folders, move files, and manage permissions
- **File Preview**: Preview supported file types directly in the browser
- **Share Management**: Generate secure sharing links with expiration dates
- **Real-time Updates**: See file changes and updates in real-time
- **Version Control**: Keep track of file versions and changes
- **Search Functionality**: Quick file search with filters

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.0.0 or higher)
- Redis (for caching and real-time features)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/file-sharing-system.git
cd file-sharing-system
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment Setup**

Create `.env` files in both frontend and backend directories:

Backend `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/file-sharing
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
REDIS_URL=redis://localhost:6379
```

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

## 🚀 Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm run dev
```

2. **Start the Frontend Application**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
