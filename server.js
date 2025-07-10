require('dotenv').config();          

const express  = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const hnRouter = require('./routes/hn');
const { router: authRouter } = require('./routes/auth');
const ratingsRouter = require('./routes/ratings');
const commentsRouter = require('./routes/comments');


const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());              // parse JSON bodies
app.use(cors());

// Public routes
app.use('/api/auth', authRouter);
app.use('/api', hnRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/comments', commentsRouter);

// Basic route to verify server up - health checks
app.get('/', (req, res) => {
  res.send('🟢 API is running');
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
