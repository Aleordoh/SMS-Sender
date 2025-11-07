// Initial contents for app.js
const express = require('express');
const app = express();

// Middleware and routes setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const smsRoutes = require('./routes/sms');
app.use('/sms', smsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
