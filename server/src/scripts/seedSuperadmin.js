import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/statuses.js';

// Load environment variables from the server root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedSuperadmin = async () => {
  try {
    const {
      MONGODB_URI,
      SUPERADMIN_NAME,
      SUPERADMIN_EMAIL,
      SUPERADMIN_PASSWORD,
    } = process.env;

    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    if (!SUPERADMIN_NAME || !SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
      console.error(
        'Error: SUPERADMIN_NAME, SUPERADMIN_EMAIL, and SUPERADMIN_PASSWORD must be defined in .env'
      );
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Check if the superadmin already exists
    const existingSuperadmin = await User.findOne({ email: SUPERADMIN_EMAIL });

    if (existingSuperadmin) {
      console.log(`Superadmin with email ${SUPERADMIN_EMAIL} already exists. Skipping seeding.`);
    } else {
      console.log('Creating superadmin account...');
      const superadmin = new User({
        name: SUPERADMIN_NAME,
        email: SUPERADMIN_EMAIL,
        password: SUPERADMIN_PASSWORD,
        role: USER_ROLES.SUPERADMIN,
        emailVerified: true, // Superadmins are pre-verified
      });

      await superadmin.save();
      console.log('Superadmin created successfully!');
    }

    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding superadmin:', error);
    process.exit(1);
  }
};

seedSuperadmin();
