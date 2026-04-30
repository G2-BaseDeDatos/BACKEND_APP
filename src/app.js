const express = require('express');
const cors = require('cors');

const app = express();
const testRoutes = require('./Routes/testRoutes');

app.use(cors());
app.use(express.json());

// Routes
app.use('/', testRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo sali mal!',
    message: err.message
  });
});

app.listen(3006, () => {
  console.log("Backend corriendo en http://localhost:3006");
});