const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// IMPORTANT: Put your password here!
mongoose.connect('mongodb+srv://cherryrr79:Qwerty79@cluster0.hpaiftt.mongodb.net/liquid3_db?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Failed to connect:', err));

// NEW: Added methaneLevel to the blueprint
// ... [Keep your exact imports and MongoDB connection here] ...

// NEW: Added co2Intake to the schema
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  irStatus: Number,
  liquidLevel: Number,
  methaneLevel: Number, 
  co2Intake: Number, // Saving real data!
  timestamp: { type: Date, default: Date.now }
});

const SensorReading = mongoose.model('SensorReading', sensorSchema);

app.post('/api/sensors', async (req, res) => {
  try {
    const newReading = new SensorReading({
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      irStatus: req.body.irStatus,
      liquidLevel: req.body.liquidLevel,
      methaneLevel: req.body.methaneLevel,
      co2Intake: req.body.co2Intake // Catching MQ-2 data
    });
    
    await newReading.save();
    console.log("New sensor data saved:", req.body);
    res.status(200).send({ message: "Data logged!" });
  } catch (error) {
    res.status(500).send({ message: "Error saving data" });
  }
});

// ... [Keep your app.get and app.listen exact code here] ...


app.get('/api/data', async (req, res) => {
  try {
    const historicalData = await SensorReading.find().sort({ timestamp: -1 }).limit(15);
    res.status(200).json(historicalData);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch data" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});