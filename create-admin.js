const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Import the User model
const User = require('./models/userModel');

const createAdmin = async () => {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@pccegoa.edu.in',
      password: hashedPassword,
      department: 'Administration',
      year: 'N/A',
      division: 'N/A',
      location: 'Admin Office',
      isAdmin: true
    });

    console.log('Admin user created successfully');
    console.log(adminUser);
    
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the function
createAdmin();