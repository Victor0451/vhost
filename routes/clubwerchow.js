var express = require("express");
var router = express.Router();
const axios = require("axios");
const path = require("path");
const { check, validationResult } = require("express-validator");

/* GET home page. */
router.get("/", async (req, res) => {
  res.render(
    path.join(__dirname, "../projects/clubwerchow/src/views/index.hbs")
  );
});

router.get("/comerciosadheridos", async (req, res) => {
  await axios
    .get("http://190.231.32.232:5002/api/clubwerchow/comercios/comercios")
    .then((comercios) => {
      let comlist = comercios.data;

      res.render(
        path.join(
          __dirname,
          "../projects/clubwerchow/src/views/comerciosadheridos.hbs"
        ),

        { comlist }
      );
      req.session.errors = null;
    })

    .catch((error) => {
      console.log(error);
    });
});

router.get("/solicitudtarjeta", async (req, res) => {
  res.render(
    path.join(
      __dirname,
      "../projects/clubwerchow/src/views/solicitudtarjeta.hbs"
    ),

    {
      errors: req.session.errors,
      success: req.session.success,
      form: req.session.form,
    }
  );
  req.session.errors = null;
});

router.get("/ganadoressorteo", async (req, res) => {
  res.render(
    path.join(
      __dirname,
      "../projects/clubwerchow/src/views/ganadoressorteo.hbs"
    )
  );
});

router.post(
  "/enviarsoli",
  [
    check("dni").notEmpty().withMessage("El DNI es obligatorio"),
    check("dni")
      .isLength({ max: 9, min: 7 })
      .withMessage("El DNI debe tener entre 7 y 9 caracteres"),
    check("apellido").notEmpty().withMessage("El apellido es obligatorio"),
    check("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    check("mail").notEmpty().withMessage("El mail es obligatorio"),
    check("mail")
      .isEmail()
      .withMessage("El mail debe tener el siguiente formato user@mail.com"),
    check("telefono").notEmpty().withMessage("El telefono es obligatorio"),
    check("es")
      .notEmpty()
      .withMessage("Debes identificarte eligiendo una opcion"),
  ],

  (req, res) => {
    let solicitud = {
      apellido: req.body.apellido,
      nombre: req.body.nombre,
      dni: req.body.dni,
      mail: req.body.mail,
      telefono: req.body.telefono,
      es: req.body.es,
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.errors = errors.errors;
      req.session.success = false;
      req.session.form = solicitud;
    } else {
      req.session.success = true;

      axios
        .post(
          "http://190.231.32.232:5002/api/clubwerchow/socios/nuevasol",
          solicitud
        )
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => {
          console.log(error);
        });

      req.session.form = {};
    }
    res.redirect("/solicitudtarjeta");
  }
);

module.exports = router;
