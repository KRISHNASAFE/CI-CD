const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();

// Connect to MySQL database from the server
const sequelize = new Sequelize('mydatabase', 'root', '', {
  dialect: 'mysql',
  host: 'localhost',
  password: ''
});

// Define a model
const User = sequelize.define('User', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
});

// Sync the model with the database
sequelize.sync();

// Middleware
app.use(express.json());

// Endpoints
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const user = await User.create({ name, email });
  res.json(user);
});

// Protection middleware
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token !== 'secret-token') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
