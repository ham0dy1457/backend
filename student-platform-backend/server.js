const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 2. Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  parentsName: String,
  phone: String,
  parentsPhone: String,
  school: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// 3. Sign Up Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, parentsName, phone, parentsPhone, school, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      parentsName,
      phone,
      parentsPhone,
      school,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// 4. Sign In Route
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    res.json({ message: 'Sign in successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 5. Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
}); 