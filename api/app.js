const cors = require('cors');
const express = require('express');

const app = express();
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  const response = {
    "Status": "Running"
  };
  res.send(response);
});

app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);
