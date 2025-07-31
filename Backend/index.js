const express = require('express');
const fetchColabRouter = require('./fetchColab');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(fetchColabRouter);

app.get('/', (req, res) => {
  res.send('Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
