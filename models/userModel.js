const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /@pccegoa\.edu\.in$/,
        'Please use a valid college email ending with @pccegoa.edu.in',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    department: {
      type: String,
      required: [true, 'Please add your department'],
    },
    year: {
      type: String,
      required: [true, 'Please add your academic year'],
    },
    division: {
      type: String,
    },
    location: {
      type: String,
      required: [true, 'Please add your location'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlockchainVerified: {
      type: Boolean,
      default: false,
    },
    metamaskId: {
      type: String,
      validate: {
        validator: function(v) {
          return v === null || v === undefined || /^[0-9]{15}$/.test(v);
        },
        message: props => `${props.value} is not a valid Metamask ID! Must be 15 digits.`
      }
    },
    blockchainVerificationStatus: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied',
    },
    profileImage: {
      type: String,
      default: 'default-profile.jpg',
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
    blacklistReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);