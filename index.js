const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// IMPORTANT: Put your actual password back in this link!
mongoose.connect('mongodb+srv://cherryrr79:YOUR_PASSWORD_HERE@cluster0.hpaiftt.mongodb.net/liquid3_db?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// UPDATED: Changed flowRate to liquidLevel
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  irStatus: Number,
  liquidLevel: Number, 
  timestamp: { type: Date, default: Date.now }
});

const SensorReading = mongoose.model('SensorReading', sensorSchema);

app.post('/api/sensors', async (req, res) => {
  try {
    // UPDATED: Catching liquidLevel from NodeMCU
    const newReading = new SensorReading({
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      irStatus: req.body.irStatus,
      liquidLevel: req.body.liquidLevel
    });
    
    await newReading.save();
    console.log("New sensor data saved:", req.body);
    res.status(200).send({ message: "Data securely logged in database!" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send({ message: "Error saving data" });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const historicalData = await SensorReading.find().sort({ timestamp: -1 }).limit(15);
    res.status(200).json(historicalData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send({ message: "Failed to fetch data" });
  }
});

app.listen(port, () => {
  console.log(`Server is awake and listening at port ${port}`);
});