const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const routes = require("./routes/routes");
require("dotenv").config();

const PORT = process.env.PORT || 80;

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

app.use((err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      status: false,
      message: "PDF size must be 5MB or less",
    });
  }

  return res.status(400).json({
    status: false,
    message: err.message || "Request failed",
  });
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
