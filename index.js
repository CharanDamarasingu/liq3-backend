const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 1. Open the bridge for your React frontend
app.use(cors());
app.use(express.json());

// 2. Connect to your local MongoDB
mongoose.connect('mongodb+srv://cherryrr79:Qwerty79@cluster0.hpaiftt.mongodb.net/liquid3_db?retryWrites=true&w=majority')  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// 3. Define the blueprint for your Liquid 3 data
// UPDATED: Matched schema to the exact data coming from your NodeMCU & Arduino
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  irStatus: Number,
  flowRate: Number,
  timestamp: { type: Date, default: Date.now }
});

const SensorReading = mongoose.model('SensorReading', sensorSchema);

// 4. INCOMING ROUTE: Catch data from your ESP8266 and save it
app.post('/api/sensors', async (req, res) => {
  try {
    // UPDATED: Map the incoming JSON payload to the database blueprint
    const newReading = new SensorReading({
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      irStatus: req.body.irStatus,
      flowRate: req.body.flowRate
    });
    
    await newReading.save();
    console.log("New sensor data saved:", req.body);
    res.status(200).send({ message: "Data securely logged in database!" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send({ message: "Error saving data" });
  }
});

// 5. OUTGOING ROUTE: Send data to your React SCADA Dashboard
app.get('/api/data', async (req, res) => {
  try {
    // Grab the 15 most recent readings for the chart
    const historicalData = await SensorReading.find().sort({ timestamp: -1 }).limit(15);
    res.status(200).json(historicalData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send({ message: "Failed to fetch data" });
  }
});

// 6. Keep the server awake and listening!
app.listen(port, () => {
  console.log(`Server is awake and listening at http://localhost:${port}`);
});