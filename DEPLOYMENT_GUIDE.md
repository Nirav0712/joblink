# Deployment Guide for Hostinger

## 🌐 Domain Configuration

Your application has been configured to use `www.astroshivaurica.com` as the production domain.

## 📁 Files Updated

The following files have been updated to use the production domain:

### Backend
- `Backend/server.js` - CORS configuration updated
- `Backend/env.example` - Frontend URL updated

### Frontend
- `Frontend/src/services/api.js` - API base URL updated
- `Frontend/src/contexts/AuthContext.jsx` - API base URL updated
- `Frontend/src/pages/Settings.jsx` - API endpoints updated
- `Frontend/src/pages/Profile.jsx` - API endpoints updated

## 🔧 Environment Variables for Production

Create a `.env` file in the Backend directory with these values:

```env
# Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration - Update with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joblink?retryWrites=true&w=majority

# JWT Configuration - Use a strong secret in production
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://www.astroshivaurica.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment Steps

### Backend Deployment (Node.js)

1. **Upload Backend Files**
   - Upload the entire `Backend` folder to your Hostinger server
   - Ensure Node.js is installed on your server

2. **Install Dependencies**
   ```bash
   cd Backend
   npm install --production
   ```

3. **Configure Environment**
   - Create `.env` file with production values
   - Update MongoDB connection string
   - Set secure JWT secret

4. **Start the Server**
   ```bash
   npm start
   ```
   Or use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name joblink-api
   pm2 startup
   pm2 save
   ```

### Frontend Deployment (Static Files)

1. **Build the Frontend**
   ```bash
   cd Frontend
   npm install
   npm run build
   ```

2. **Upload Build Files**
   - Upload the contents of `dist` folder to your domain's public_html directory
   - Ensure all files are uploaded to `https://www.astroshivaurica.com`

### Database Setup

1. **MongoDB Atlas (Recommended)**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get the connection string
   - Update MONGODB_URI in your .env file

2. **Local MongoDB (Alternative)**
   - Install MongoDB on your server
   - Update MONGODB_URI to use local connection

## 🔒 SSL Certificate

Ensure your domain has SSL certificate enabled:
- Hostinger usually provides free SSL certificates
- Verify HTTPS is working on both frontend and backend

## 🧪 Testing Deployment

1. **Test Frontend**
   - Visit: `https://www.astroshivaurica.com`
   - Verify the application loads correctly

2. **Test Backend API**
   - Visit: `https://www.astroshivaurica.com/api/health`
   - Should return API health status

3. **Test Authentication**
   - Try registering a new user
   - Try logging in
   - Verify API calls work correctly

## 📝 Important Notes

- All API calls now point to `https://www.astroshivaurica.com/api`
- CORS is configured to allow requests from your domain
- Localhost references are kept for development purposes
- Make sure to use HTTPS in production for security

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Verify FRONTEND_URL in backend .env file
   - Check CORS configuration in server.js

2. **API Not Found**
   - Ensure backend is running on the correct port
   - Check if API routes are properly configured

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check if database is accessible from your server

4. **Build Issues**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

## 📞 Support

If you encounter any issues during deployment, check:
- Hostinger documentation for Node.js deployment
- MongoDB Atlas connection guides
- SSL certificate configuration
