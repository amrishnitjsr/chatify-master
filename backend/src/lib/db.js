import mongoose from "mongoose";
import { ENV, isDevelopment } from "./env.js";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");

    console.log("🔄 Attempting to connect to MongoDB...");
    console.log(`📍 Database URI: ${MONGO_URI.includes('@') ? MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : MONGO_URI}`);

    // Configure mongoose options
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    const conn = await mongoose.connect(ENV.MONGO_URI, options);
    console.log("✅ MONGODB CONNECTED:", conn.connection.host);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("💥 Error connecting to MONGODB:", error.message);
    
    if (isDevelopment) {
      console.log("\n🚨 DEVELOPMENT MODE SUGGESTIONS:");
      console.log("1. Install MongoDB locally: https://www.mongodb.com/try/download/community");
      console.log("2. Or use MongoDB Atlas and whitelist your IP:");
      console.log("   - Go to MongoDB Atlas → Network Access");
      console.log("   - Add your current IP address");
      console.log("   - Or add 0.0.0.0/0 for development (not recommended for production)");
      console.log("3. Or use a local connection string: mongodb://localhost:27017/chatify");
      console.log("\n🔧 Your current MONGO_URI:", ENV.MONGO_URI);
    }
    
    // In development, we can continue without crashing to allow frontend testing
    if (isDevelopment) {
      console.log("\n⚠️  Continuing in development mode without database...");
      console.log("⚠️  Authentication and data persistence will not work!");
      return;
    }
    
    process.exit(1); // Only exit in production
  }
};
