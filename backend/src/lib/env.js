import "dotenv/config";

// Environment configuration with validation and defaults
export const ENV = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/chatify',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-here',

  // Client/Frontend URLs
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Email Configuration (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Chatify',

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Security Configuration (Arcjet)
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV || 'development',

  // Message Encryption Configuration
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || 'your-encryption-secret-here',
  ENCRYPTION_SALT: process.env.ENCRYPTION_SALT || 'your-encryption-salt-here',
};

// Validation for required environment variables
const validateEnv = () => {
  const requiredVars = {
    MONGO_URI: ENV.MONGO_URI,
    JWT_SECRET: ENV.JWT_SECRET,
    ENCRYPTION_SECRET: ENV.ENCRYPTION_SECRET,
    ENCRYPTION_SALT: ENV.ENCRYPTION_SALT,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value || value === `your-${key.toLowerCase().replace('_', '-')}-here`)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please check your .env file in the backend directory');

    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Validate environment variables on import
validateEnv();

// Development helper
export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 Environment Configuration:');
  console.log(`   - Mode: ${ENV.NODE_ENV}`);
  console.log(`   - Port: ${ENV.PORT}`);
  console.log(`   - Client URL: ${ENV.CLIENT_URL}`);
  console.log(`   - Database: ${ENV.MONGO_URI ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   - JWT Secret: ${ENV.JWT_SECRET !== 'your-jwt-secret-key-here' ? '✅ Set' : '❌ Default'}`);
  console.log(`   - Cloudinary: ${ENV.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Resend Email: ${ENV.RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Arcjet Security: ${ENV.ARCJET_KEY ? '✅ Configured' : '❌ Not configured'}`);
}
