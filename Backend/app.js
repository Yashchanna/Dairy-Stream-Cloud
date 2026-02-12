const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connect } = require('./config');
const initializeDatabase = require('./utils/initializeDatabase');

const agentRoutes = require('./routes/agentRoutes');
const adminRoutes = require('./routes/admin.routes'); // ✅ FIXED
const authRoutes = require('./routes/authroutes');     // ✅ explicit
const customerRoutes = require('./routes/CustomerRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use("/api", routes);


// DB
connect();

if (process.env.SUPABASE_AUTO_INIT === 'true') {
  initializeDatabase();
} else {
  console.log(
    'ℹ️ Automatic DB initialization is disabled. To enable, set SUPABASE_AUTO_INIT=true in your .env file.'
  );
}

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  }
  console.error(err);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date()
  });
});
