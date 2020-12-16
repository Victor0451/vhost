var express = require("express");
var router = express.Router();
const axios = require("axios");
const path = require("path");

/* GET home page. */
router.get("/", async (req, res) => {
  res.render(
    path.join(__dirname, "../projects/grupowerchow/src/views/index.hbs")
  );
});

module.exports = router;
