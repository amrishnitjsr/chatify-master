# 🚀 Deployment Guide for Chatify

This guide helps you deploy Chatify to production environments by managing environment variables effectively.

## 📁 Environment Files Structure

```
chatify-master/
├── backend/
│   ├── .env                      # Current backend environment config
│   ├── .env.production.example   # Production configuration template
│   └── .gitignore               # Protects sensitive environment files
└── frontend/
    ├── .env                     # Main frontend environment config
    ├── .env.local              # Local development overrides
    ├── .env.production.example # Production configuration template
    └── .gitignore              # Protects sensitive environment files
```

## 🔧 Development Setup

### Backend (.env)
- Contains all necessary environment variables
- Pre-configured for local development
- Includes your current database and service credentials

### Frontend (.env & .env.local)
- `.env`: Main configuration
- `.env.local`: Local overrides (higher priority)
- Automatically detects localhost:3000 for backend

## 🌐 Production Deployment

### Step 1: Prepare Backend Environment

1. Copy the production template:
   ```bash
   cp backend/.env.production.example backend/.env.production
   ```

2. Update the following in `.env.production`:
   ```bash
   # Update these for production:
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-deployed-url.com
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatify-prod
   JWT_SECRET=your-super-secure-production-jwt-secret
   ARCJET_ENV=production
   ```

### Step 2: Prepare Frontend Environment

1. Copy the production template:
   ```bash
   cp frontend/.env.production.example frontend/.env.production
   ```

2. Update the following in `.env.production`:
   ```bash
   # Update these for production:
   VITE_APP_MODE=production
   VITE_API_BASE_URL=https://your-backend-deployed-url.com/api
   VITE_SOCKET_URL=https://your-backend-deployed-url.com
   VITE_DEBUG_MODE=false
   VITE_SHOW_LOGS=false
   ```

## 🏗️ Platform-Specific Examples

### Railway Deployment
```bash
# Backend (.env.production)
CLIENT_URL=https://chatify-frontend.up.railway.app

# Frontend (.env.production)
VITE_API_BASE_URL=https://chatify-backend.up.railway.app/api
VITE_SOCKET_URL=https://chatify-backend.up.railway.app
```

### Vercel + Railway
```bash
# Backend on Railway (.env.production)
CLIENT_URL=https://chatify-app.vercel.app

# Frontend on Vercel (.env.production)
VITE_API_BASE_URL=https://chatify-backend.up.railway.app/api
VITE_SOCKET_URL=https://chatify-backend.up.railway.app
```

### Render Deployment
```bash
# Backend (.env.production)
CLIENT_URL=https://chatify-frontend.onrender.com

# Frontend (.env.production)
VITE_API_BASE_URL=https://chatify-backend.onrender.com/api
VITE_SOCKET_URL=https://chatify-backend.onrender.com
```

### Same Domain Deployment
If your backend serves the frontend:
```bash
# Frontend (.env.production)
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=/
```

## 🔐 Security Considerations

### Environment File Protection
- ✅ `.env.local`, `.env.production` are in `.gitignore`
- ✅ Example files (`.env.production.example`) are safe to commit
- ❌ Never commit actual `.env` files with credentials

### Production Secrets
1. **Generate Strong JWT Secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Use Production Database**:
   - Create a separate MongoDB database for production
   - Use MongoDB Atlas with proper IP whitelisting
   - Enable authentication and use strong passwords

3. **Service Credentials**:
   - Use production API keys for Cloudinary, Resend, Arcjet
   - Enable proper CORS settings for your domain

## 🚀 Quick Deployment Checklist

### Before Deployment:
- [ ] Update `CLIENT_URL` in backend `.env`
- [ ] Update `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in frontend `.env`
- [ ] Set `NODE_ENV=production` in backend
- [ ] Set `VITE_APP_MODE=production` in frontend
- [ ] Use production MongoDB URI
- [ ] Generate strong production JWT secret
- [ ] Disable debug modes in frontend

### After Deployment:
- [ ] Test API endpoints
- [ ] Test WebSocket connection
- [ ] Test image uploads (Cloudinary)
- [ ] Test email functionality (Resend)
- [ ] Verify authentication flow
- [ ] Check CORS settings

## 🔄 Environment Updates

To update configurations after deployment:

1. **Change Backend Port**:
   ```bash
   # In backend/.env
   PORT=8080
   ```

2. **Change Frontend Backend URL**:
   ```bash
   # In frontend/.env
   VITE_API_BASE_URL=https://new-backend-url.com/api
   VITE_SOCKET_URL=https://new-backend-url.com
   ```

3. **Switch Database**:
   ```bash
   # In backend/.env
   MONGO_URI=mongodb+srv://new-credentials@new-cluster.mongodb.net/new-db
   ```

After updating `.env` files, redeploy your applications.

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Check `CLIENT_URL` matches your frontend domain
2. **Socket Connection Failed**: Verify `VITE_SOCKET_URL` is correct
3. **API 404 Errors**: Check `VITE_API_BASE_URL` path
4. **Database Connection**: Verify MongoDB URI and network access
5. **Authentication Issues**: Check JWT secret consistency

### Debug Mode:
Enable debug mode in development:
```bash
# In frontend/.env.local
VITE_DEBUG_MODE=true
VITE_SHOW_LOGS=true
```

This will show detailed logs for API requests and socket connections.