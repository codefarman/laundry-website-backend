import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from './models/BranchModel.js';

dotenv.config();

const branches = [
  {
    name: 'Main Branch',
    address: 'Musaffah Shabiya, ME - 11, M.B.Z Abu Dhabi',
    contactNumbers: ['050 4224 956', '055 1452 443'],
    lat: 24.3267,
    lng: 54.5319,
  },
  {
    name: 'Branch 2',
    address: 'Near Emirates Nation School, Abu Dhabi, U.A.E.',
    contactNumbers: ['050 4224 956', '055 1452 443'],
    lat: 24.47,
    lng: 54.38,
  },
  {
    name: 'Branch 3',
    address: '7th Building Baniyas Court West, Abu Dhabi, U.A.E.',
    contactNumbers: ['050 4224 956'],
    lat: 24.3,
    lng: 54.63,
  },
];

const seedBranches = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    await Branch.deleteMany({});
    console.log('Cleared existing branches');

    await Branch.insertMany(branches);
    console.log('Seeded branches successfully');

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding branches:', error);
    process.exit(1);
  }
};

seedBranches();