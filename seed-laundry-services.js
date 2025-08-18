import dotenv from 'dotenv';
import mongoose from 'mongoose';
import LaundryService from './models/laundry-service.js';

dotenv.config();

const services = [
  {
    category: 'Wash & Fold',
    description: 'Fresh cleaning for your daily laundry needs.',
    icon: 'fas fa-shirt',
    items: [
      { title: 'Mixed Load (up to 6kg)', price: 'AED 48', note: '' },
      { title: 'Separate Load (up to 12kg)', price: 'AED 96', note: '' },
      { title: 'Each Additional 1kg', price: 'AED 8', note: '' },
      { title: '30kg Bulk', price: 'AED 7.5/kg', note: '' },
      { title: '60kg Bulk', price: 'AED 7.25/kg', note: '' },
      { title: '120kg Bulk', price: 'AED 7/kg', note: '' },
    ],
  },
  {
    category: 'Clean & Iron',
    description: 'Perfect for pressed and pristine garments.',
    icon: 'fas fa-ironing',
    items: [
      { title: 'Shirt', price: 'AED 5', note: '' },
      { title: 'T Shirt', price: 'AED 5', note: '' },
      { title: 'Under T Shirt', price: 'AED 3', note: '' },
      { title: 'Top', price: 'AED 6', note: '' },
      { title: 'Blouse', price: 'AED 5', note: '' },
      { title: 'Sweater', price: 'AED 10', note: '' },
      { title: 'Trouser', price: 'AED 5', note: '' },
      { title: 'Pajama', price: 'AED 5', note: '' },
      { title: 'Half Pant', price: 'AED 5', note: '' },
      { title: 'Skirt', price: 'AED 6', note: '' },
      { title: 'Lungi', price: 'AED 4', note: '' },
      { title: 'Suit', price: 'AED 20', note: '' },
      { title: 'Army Suit', price: 'AED 15', note: '' },
      { title: 'Pakistani Men Suit', price: 'AED 10', note: '' },
      { title: 'Pakistani Ladies Suit', price: 'AED 15', note: '' },
      { title: 'Coverall', price: 'AED 10', note: '' },
      { title: 'Baby Dress', price: 'AED 10', note: '' },
      { title: 'Ladies Dress', price: 'AED 15', note: '' },
      { title: 'Ladies Dress Big', price: 'AED 20', note: '' },
      { title: 'Sari', price: 'AED 10', note: '' },
      { title: 'Summer Kandoora', price: 'AED 10', note: '' },
      { title: 'Hot Kandoora', price: 'AED 15', note: '' },
      { title: 'Tarbooj', price: 'AED 2', note: '' },
      { title: 'Ghutra', price: 'AED 5', note: '' },
      { title: 'Hot Ghutra', price: 'AED 6', note: '' },
      { title: 'Shimagh', price: 'AED 5', note: '' },
      { title: 'Ghafia', price: 'AED 2', note: '' },
      { title: 'Abaya', price: 'AED 10', note: '' },
      { title: 'Shella', price: 'AED 5', note: '' },
      { title: 'Jacket', price: 'AED 10', note: '' },
      { title: 'Under Wear', price: 'AED 3', note: '' },
      { title: 'Socks', price: 'AED 3', note: '' },
      { title: 'Tie', price: 'AED 6', note: '' },
      { title: 'Cap', price: 'AED 5', note: '' },
      { title: 'Bed Sheet Big', price: 'AED 10', note: '' },
      { title: 'Bed Sheet Small', price: 'AED 8', note: '' },
      { title: 'Bed Spread', price: 'AED 25', note: '' },
      { title: 'Bed Spread Big', price: 'AED 25', note: '' },
      { title: 'Blanket', price: 'AED 20', note: '' },
      { title: 'Blanket Big', price: 'AED 25', note: '' },
      { title: 'Pillow Cover', price: 'AED 4', note: '' },
      { title: 'Pillow', price: 'AED 10', note: '' },
      { title: 'Towel', price: 'AED 6', note: '' },
      { title: 'Towel Small', price: 'AED 5', note: '' },
      { title: 'Bath Towel', price: 'AED 10', note: '' },
      { title: 'Curtains', price: 'AED 15-20', note: '* Price varies by size' },
      { title: 'Curtain Rubber', price: 'AED 40', note: '* Per meter' },
      { title: 'Carpet', price: 'AED 15', note: '' },
      { title: 'Shoe', price: 'AED 10', note: '' },
    ],
  },
  {
    category: 'Ironing',
    description: 'Crisp finish for clean clothes.',
    icon: 'fas fa-steam-iron',
    items: [
      { title: 'Shirt', price: 'AED 2', note: '' },
      { title: 'T Shirt', price: 'AED 2', note: '' },
      { title: 'Under T Shirt', price: 'AED 1.5', note: '' },
      { title: 'Top', price: 'AED 3', note: '' },
      { title: 'Blouse', price: 'AED 3', note: '' },
      { title: 'Sweater', price: 'AED 5', note: '' },
      { title: 'Trouser', price: 'AED 2', note: '' },
      { title: 'Pajama', price: 'AED 2', note: '' },
      { title: 'Half Pant', price: 'AED 2', note: '' },
      { title: 'Skirt', price: 'AED 3', note: '' },
      { title: 'Lungi', price: 'AED 2', note: '' },
      { title: 'Suit', price: 'AED 8', note: '' },
      { title: 'Army Suit', price: 'AED 6', note: '' },
      { title: 'Pakistani Men Suit', price: 'AED 4', note: '' },
      { title: 'Pakistani Ladies Suit', price: 'AED 6', note: '' },
      { title: 'Coverall', price: 'AED 4', note: '' },
      { title: 'Baby Dress', price: 'AED 5', note: '' },
      { title: 'Ladies Dress', price: 'AED 6', note: '' },
      { title: 'Ladies Dress Big', price: 'AED 7', note: '' },
      { title: 'Sari', price: 'AED 5', note: '' },
      { title: 'Summer Kandoora', price: 'AED 3', note: '' },
      { title: 'Hot Kandoora', price: 'AED 5', note: '' },
      { title: 'Tarbooj', price: 'AED 0', note: '' },
      { title: 'Ghutra', price: 'AED 3', note: '' },
      { title: 'Hot Ghutra', price: 'AED 4', note: '' },
      { title: 'Shimagh', price: 'AED 3', note: '' },
      { title: 'Ghafia', price: 'AED 1', note: '' },
      { title: 'Abaya', price: 'AED 5', note: '' },
      { title: 'Shella', price: 'AED 2', note: '' },
      { title: 'Jacket', price: 'AED 5', note: '' },
      { title: 'Tie', price: 'AED 3', note: '' },
      { title: 'Cap', price: 'AED 2', note: '' },
      { title: 'Under Wear', price: 'AED 1.5', note: '' },
      { title: 'Socks', price: 'AED 1.5', note: '' },
      { title: 'Bed Sheet Big', price: 'AED 6', note: '' },
      { title: 'Bed Sheet Small', price: 'AED 5', note: '' },
      { title: 'Bed Spread', price: 'AED 0', note: '' },
      { title: 'Bed Spread Big', price: 'AED 0', note: '' },
      { title: 'Pillow Cover', price: 'AED 1.5', note: '' },
    ],
  },
  {
    category: 'Duvets & Bulky',
    description: 'Care for larger household items.',
    icon: 'fas fa-bed',
    items: [
      { title: 'Blanket', price: 'AED 20', note: '' },
      { title: 'Blanket Big', price: 'AED 25', note: '' },
      { title: 'Bed Spread', price: 'AED 25', note: '' },
      { title: 'Bed Spread Big', price: 'AED 25', note: '' },
      { title: 'Pillow', price: 'AED 10', note: '' },
      { title: 'Pillow Cover', price: 'AED 4', note: '' },
      { title: 'Curtains', price: 'AED 15-20', note: '* Price varies by size' },
      { title: 'Curtain Rubber', price: 'AED 40', note: '* Per meter' },
      { title: 'Carpet', price: 'AED 15', note: '' },
    ],
  },
  {
    category: 'Dry Cleaning',
    description: 'Professional dry cleaning for delicate items.',
    icon: 'fas fa-tint',
    items: [
      { title: 'Shirt', price: 'AED 5', note: '' },
      { title: 'T Shirt', price: 'AED 5', note: '' },
      { title: 'Under T Shirt', price: 'AED 3', note: '' },
      { title: 'Top', price: 'AED 6', note: '' },
      { title: 'Blouse', price: 'AED 5', note: '' },
      { title: 'Sweater', price: 'AED 10', note: '' },
      { title: 'Trouser', price: 'AED 5', note: '' },
      { title: 'Pajama', price: 'AED 5', note: '' },
      { title: 'Half Pant', price: 'AED 5', note: '' },
      { title: 'Skirt', price: 'AED 6', note: '' },
      { title: 'Lungi', price: 'AED 4', note: '' },
      { title: 'Suit', price: 'AED 20', note: '' },
      { title: 'Army Suit', price: 'AED 15', note: '' },
      { title: 'Pakistani Men Suit', price: 'AED 10', note: '' },
      { title: 'Pakistani Ladies Suit', price: 'AED 15', note: '' },
      { title: 'Coverall', price: 'AED 10', note: '' },
      { title: 'Baby Dress', price: 'AED 10', note: '' },
      { title: 'Ladies Dress', price: 'AED 15', note: '' },
      { title: 'Ladies Dress Big', price: 'AED 20', note: '' },
      { title: 'Sari', price: 'AED 10', note: '' },
      { title: 'Summer Kandoora', price: 'AED 10', note: '' },
      { title: 'Hot Kandoora', price: 'AED 15', note: '' },
      { title: 'Tarbooj', price: 'AED 2', note: '' },
      { title: 'Ghutra', price: 'AED 5', note: '' },
      { title: 'Hot Ghutra', price: 'AED 6', note: '' },
      { title: 'Shimagh', price: 'AED 5', note: '' },
      { title: 'Ghafia', price: 'AED 2', note: '' },
      { title: 'Abaya', price: 'AED 10', note: '' },
      { title: 'Shella', price: 'AED 5', note: '' },
      { title: 'Jacket', price: 'AED 10', note: '' },
      { title: 'Under Wear', price: 'AED 3', note: '' },
      { title: 'Socks', price: 'AED 3', note: '' },
      { title: 'Tie', price: 'AED 6', note: '' },
      { title: 'Cap', price: 'AED 5', note: '' },
      { title: 'Bed Sheet Big', price: 'AED 10', note: '' },
      { title: 'Bed Sheet Small', price: 'AED 8', note: '' },
      { title: 'Bed Spread', price: 'AED 25', note: '' },
      { title: 'Bed Spread Big', price: 'AED 25', note: '' },
      { title: 'Blanket', price: 'AED 20', note: '' },
      { title: 'Blanket Big', price: 'AED 25', note: '' },
      { title: 'Pillow Cover', price: 'AED 4', note: '' },
      { title: 'Pillow', price: 'AED 10', note: '' },
      { title: 'Towel', price: 'AED 6', note: '' },
      { title: 'Towel Small', price: 'AED 5', note: '' },
      { title: 'Bath Towel', price: 'AED 10', note: '' },
      { title: 'Curtains', price: 'AED 15-20', note: '* Price varies by size' },
      { title: 'Curtain Rubber', price: 'AED 40', note: '* Per meter' },
      { title: 'Carpet', price: 'AED 15', note: '' },
      { title: 'Shoe', price: 'AED 15', note: '' },
    ],
  },
];

const seedServices = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    await LaundryService.deleteMany({});
    console.log('Cleared existing services');

    await LaundryService.insertMany(services);
    console.log('Seeded services successfully');

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding services:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to error');
    }
    process.exit(1);
  }
};

seedServices();


