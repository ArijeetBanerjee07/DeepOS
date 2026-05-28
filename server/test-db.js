const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed details:');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  });
