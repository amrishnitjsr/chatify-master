# 🗄️ MongoDB Setup Guide for Windows

## Quick Fix Options

### Option 1: Use MongoDB Atlas (Cloud) - Recommended for Production

1. **Get Your IP Address:**
   - Go to <https://whatismyipaddress.com/>
   - Copy your IPv4 address

2. **Whitelist Your IP in MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Navigate to: Security → Network Access
   - Click "Add IP Address"
   - Add your current IP address
   - Or add `0.0.0.0/0` for development (allows all IPs)

3. **Update .env with Atlas URI:**

   ```bash
   # In backend/.env, uncomment one of these:
   MONGO_URI=mongodb+srv://swatisingh90909_db_user:J1V2wJaEgJUavESf@cluster0.i9pi03a.mongodb.net/?appName=Cluster0
   ```

### Option 2: Install MongoDB Locally (Recommended for Development)

1. **Install MongoDB Community Server:**
   - Download from: <https://www.mongodb.com/try/download/community>
   - Choose Windows x64
   - Install with default settings
   - Make sure to install MongoDB Compass (GUI tool)

2. **Start MongoDB Service:**

   ```powershell
   # Method 1: As Windows Service (automatic)
   net start MongoDB

   # Method 2: Manual start
   mongod --dbpath "C:\data\db"
   ```

3. **Update .env for Local MongoDB:**

   ```bash
   # In backend/.env, use local connection:
   MONGO_URI=mongodb://localhost:27017/chatify
   ```

### Option 3: Use Docker (Advanced)

1. **Install Docker Desktop for Windows**

2. **Run MongoDB in Docker:**

   ```powershell
   # Start MongoDB container
   docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest

   # View logs
   docker logs mongodb

   # Stop container
   docker stop mongodb
   ```

3. **Update .env:**

   ```bash
   MONGO_URI=mongodb://localhost:27017/chatify
   ```

## Testing Connection

After setting up MongoDB, test the connection:

```powershell
# In backend terminal
npm run dev
```

Look for:

- ✅ "MONGODB CONNECTED: localhost" (local)
- ✅ "MONGODB CONNECTED: cluster0-shard-xxx" (Atlas)

## Troubleshooting

### Common Issues

1. **IP Not Whitelisted (Atlas):**

   ```
   MongooseServerSelectionError: Could not connect to any servers
   ```

   **Fix:** Add your IP to Atlas Network Access

2. **MongoDB Not Running (Local):**

   ```
   MongooseServerSelectionError: connect ECONNREFUSED
   ```

   **Fix:** Start MongoDB service or install MongoDB

3. **Wrong Connection String:**

   ```
   MongooseServerSelectionError: Invalid connection string
   ```

   **Fix:** Check MONGO_URI format in .env

### Quick Commands

```powershell
# Check if MongoDB is running locally
netstat -an | findstr :27017

# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Connect using MongoDB Compass
# Connection string: mongodb://localhost:27017
```

## Current Status

Your app is currently configured for local MongoDB:

```bash
MONGO_URI=mongodb://localhost:27017/chatify
```

Choose one of the options above to get your database connected!
