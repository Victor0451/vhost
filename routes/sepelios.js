var express = require("express");
var router = express.Router();
const axios = require("axios");
const path = require("path");

const config = require('../config/config')

/* GET home page. */
router.get("/", async (req, res) => {
  res.render(path.join(__dirname, "../projects/sepelios/src/views/index.hbs"));
});

router.get("/conveniosprovinciales", async (req, res) => {
  await axios
    .get(`${config.ip}api/sepeliospag/grupos/grupos`)
    .then((listgrup) => {
      let grupos = listgrup.data;

      res.render(
        path.join(
          __dirname,
          "../projects/sepelios/src/views/conveniosprovinciales.hbs"
        ),
        { grupos }
      );
    })

    .catch((error) => {
      console.log(error);
    });
});

router.get("/conveniosnacionales", async (req, res) => {
  await axios
    .get(`${config.ip}api/clubwerchow/connac/convenios`)
    .then((listgrup) => {
      let connac = listgrup.data;

      res.render(
        path.join(
          __dirname,
          "../projects/sepelios/src/views/conveniosnacionales.hbs"
        ),
        { connac }
      );
    })

    .catch((error) => {
      console.log(error);
    });
});

router.get("/novell", async (req, res) => {
  res.render(path.join(__dirname, "../projects/sepelios/src/views/novell.hbs"));
});

router.get("/homenajesvirtuales", async (req, res) => {
  res.render(
    path.join(
      __dirname,
      "../projects/sepelios/src/views/homenajesvirtuales.hbs"
    )
  );
});

module.exports = router;
