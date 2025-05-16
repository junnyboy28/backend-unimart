const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Import models
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Chat = require('./models/chatModel');
const Message = require('./models/messageModel');
const Transaction = require('./models/transactionModel');
const Review = require('./models/reviewModel');
const Wishlist = require('./models/wishlistModel');

// Function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Main seeding function
const seedData = async () => {
  try {
    // Clear existing data (except admin)
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await Transaction.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await User.deleteMany({ isAdmin: { $ne: true } });
    
    // Get admin user
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      throw new Error('Admin user not found! Run create-admin.js first.');
    }
    
    console.log('Creating test users...');
    
    // Create regular users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@pccegoa.edu.in',
      password: await hashPassword('password123'),
      department: 'Computer Science',
      year: 'Third Year',
      division: 'A',
      location: 'Hostel Block A',
      profileImage: 'default-profile.jpg'
    });
    
    const user2 = await User.create({
      name: 'Emily Smith',
      email: 'emily@pccegoa.edu.in',
      password: await hashPassword('password123'),
      department: 'Electronics',
      year: 'Second Year',
      division: 'B',
      location: 'Campus Library',
      profileImage: 'default-profile.jpg',
      // Make user2 blockchain verified
      isBlockchainVerified: true,
      blockchainVerificationStatus: 'approved',
      metamaskId: '123456789012345'
    });
    
    const user3 = await User.create({
      name: 'Michael Brown',
      email: 'michael@pccegoa.edu.in',
      password: await hashPassword('password123'),
      department: 'Mechanical',
      year: 'Fourth Year',
      division: 'C',
      location: 'Off Campus',
      profileImage: 'default-profile.jpg',
      // Blacklisted by admin
      isBlacklisted: true,
      blacklistReason: 'Violation of terms of service'
    });
    
    console.log('Creating products...');
    
    // Products for User 1
    const product1 = await Product.create({
      name: 'Data Structures Textbook',
      seller: user1._id,
      category: 'Books',
      description: 'Slightly used textbook for Data Structures course',
      price: 450,
      images: ['uploads/default-product.jpg'],
      condition: 'Slightly Used',
      location: 'Hostel Block A'
    });
    
    const product2 = await Product.create({
      name: 'Scientific Calculator',
      seller: user1._id,
      category: 'Electronics',
      description: 'Casio scientific calculator, barely used',
      price: 750,
      images: ['uploads/default-product.jpg'],
      condition: 'Like New',
      location: 'Hostel Block A'
    });
    
    const product3 = await Product.create({
      name: 'Lab Coat',
      seller: user1._id,
      category: 'Others',
      description: 'White lab coat, size M',
      price: 300,
      images: ['uploads/default-product.jpg'],
      condition: 'New',
      location: 'Hostel Block A'
    });
    
    // Products for User 2 (Blockchain verified)
    const product4 = await Product.create({
      name: 'Arduino Kit',
      seller: user2._id,
      category: 'Electronics',
      description: 'Complete Arduino starter kit with components',
      price: 1200,
      images: ['uploads/default-product.jpg'],
      condition: 'New',
      location: 'Campus Library',
      acceptsCrypto: true // Can accept crypto since user is blockchain verified
    });
    
    const product5 = await Product.create({
      name: 'Engineering Drawing Tools',
      seller: user2._id,
      category: 'Project Materials',
      description: 'Complete set of drawing tools',
      price: 600,
      images: ['uploads/default-product.jpg'],
      condition: 'Used',
      location: 'Campus Library',
      acceptsCrypto: true
    });
    
    // Products for User 3 (Blacklisted)
    const product6 = await Product.create({
      name: 'Physics Notes',
      seller: user3._id,
      category: 'Books',
      description: 'Handwritten notes for Physics I and II',
      price: 200,
      images: ['uploads/default-product.jpg'],
      condition: 'Used',
      location: 'Off Campus'
    });
    
    const product7 = await Product.create({
      name: 'Mechanical Tools Set',
      seller: user3._id,
      category: 'Project Materials',
      description: 'Basic mechanical tools for projects',
      price: 850,
      images: ['uploads/default-product.jpg'],
      condition: 'Slightly Used',
      location: 'Off Campus'
    });
    
    console.log('Creating chats and messages...');
    
    // Chat between User1 and User2 about Arduino Kit
    const chat1 = await Chat.create({
      participants: [user1._id, user2._id],
      product: product4._id
    });
    
    // Messages for chat1
    const messages1 = await Message.create([
      {
        chat: chat1._id,
        sender: user1._id,
        content: 'Hi, is the Arduino Kit still available?',
        isRead: true,
        readAt: new Date()
      },
      {
        chat: chat1._id,
        sender: user2._id,
        content: 'Yes, it is. Are you interested in buying it?',
        isRead: true,
        readAt: new Date()
      },
      {
        chat: chat1._id,
        sender: user1._id,
        content: 'Definitely! Can we meet tomorrow at the canteen?',
        isRead: true,
        readAt: new Date()
      },
      {
        chat: chat1._id,
        sender: user2._id,
        content: 'Sure, let\'s meet at 2 PM',
        isRead: false
      }
    ]);
    
    // Update last message in chat
    await Chat.findByIdAndUpdate(
      chat1._id,
      { lastMessage: messages1[messages1.length - 1]._id }
    );
    
    // Chat between User2 and User3 about Physics Notes
    const chat2 = await Chat.create({
      participants: [user2._id, user3._id],
      product: product6._id
    });
    
    // Messages for chat2
    const messages2 = await Message.create([
      {
        chat: chat2._id,
        sender: user2._id,
        content: 'Are these notes comprehensive?',
        isRead: true,
        readAt: new Date()
      },
      {
        chat: chat2._id,
        sender: user3._id,
        content: 'Yes, they cover the entire syllabus',
        isRead: false
      }
    ]);
    
    await Chat.findByIdAndUpdate(
      chat2._id,
      { lastMessage: messages2[messages2.length - 1]._id }
    );
    
    console.log('Creating transactions...');
    
    // Transaction: User1 buys Engineering Drawing Tools from User2
    const transaction1 = await Transaction.create({
      buyer: user1._id,
      seller: user2._id,
      product: product5._id,
      amount: product5.price,
      paymentMethod: 'razorpay',
      paymentId: `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      status: 'completed'
    });
    
    // Mark the product as sold
    await Product.findByIdAndUpdate(
      product5._id,
      {
        isSold: true,
        buyer: user1._id,
        transactionId: transaction1._id
      }
    );
    
    // Transaction: User2 buys Lab Coat from User1
    const transaction2 = await Transaction.create({
      buyer: user2._id,
      seller: user1._id,
      product: product3._id,
      amount: product3.price,
      paymentMethod: 'razorpay',
      paymentId: `pay_${Date.now() + 100}_${Math.floor(Math.random() * 10000)}`,
      status: 'completed'
    });
    
    await Product.findByIdAndUpdate(
      product3._id,
      {
        isSold: true,
        buyer: user2._id,
        transactionId: transaction2._id
      }
    );
    
    console.log('Creating reviews...');
    
    // Review by User1 for the purchased Engineering Drawing Tools
    await Review.create({
      user: user1._id,
      seller: user2._id,
      product: product5._id,
      rating: 5,
      comment: 'Great quality tools and fast delivery!'
    });
    
    // Review by User2 for the purchased Lab Coat
    await Review.create({
      user: user2._id,
      seller: user1._id,
      product: product3._id,
      rating: 4,
      comment: 'Good quality lab coat, as described'
    });
    
    console.log('Creating wishlists...');
    
    // Wishlist for User1
    await Wishlist.create({
      user: user1._id,
      products: [product4._id, product6._id]
    });
    
    // Wishlist for User2
    await Wishlist.create({
      user: user2._id,
      products: [product2._id]
    });
    
    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedData();