const evh = require("express-vhost");
const express = require("express");
const exphbs = require("hbs");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const tls = require("tls");
const bodyParser = require("body-parser");
const expressSession = require("express-session");

// CONFIGS
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(expressValidator());
app.use(
  expressSession({ secret: "max", saveUninitialized: false, resave: false })
);
exphbs.registerPartials(path.join(__dirname, "/projects/partials"));

const httpPort = 2000;
const httpsPort = 2001;

const sepelioContext = tls.createSecureContext({
  key: fs.readFileSync("certs/werchow.key", "utf8"),
  cert: fs.readFileSync("certs/werchow.cert", "utf8"),
});
const grupoWerchowContext = tls.createSecureContext({
  key: fs.readFileSync("certs/grupowerchow.key", "utf8"),
  cert: fs.readFileSync("certs/grupowerchow.cert", "utf8"),
});
const options = {
  key: fs.readFileSync("certs/clubwerchow.key", "utf8"),
  cert: fs.readFileSync("certs/clubwerchow.cert", "utf8"),
  SNICallback: function (domain, cb) {
    if (domain === "sepelios.werchow.com") {
      cb(null, sepelioContext);
    } else if (domain === "grupowerchow.com") {
      cb(null, grupoWerchowContext);
    } else {
      cb();
    }
  },
};

app.use(function (req, res, next) {
  // redirect .com.ar to .com

  if (req.headers.host === "clubwerchow.com.ar") {
    res.redirect("https://clubwerchow.com");
  } else if (req.headers.host === "werchow.com") {
    res.redirect("https://werchow.com.ar");
  }
  if (req.headers.host === "grupowerchow.com.ar") {
    res.redirect("https://grupowerchow.com");
  }

  // request was via https, so do no special handling
  else if (req.secure) {
    next();
  }
  
  // request was via http, redirect to https
  else {
    res.redirect("https://" + req.headers.host + req.url);
  }
});

// Routes
const routesCW = require("./routes/clubwerchow");
const routesSep = require("./routes/sepelios");
const routesGrup = require("./routes/grupowerchow");

// Projects

const appFactory = () => {
  const app = express();

  app.use("/public", express.static(path.join(__dirname, "projects/public/")));
  app.set("views", "/projects/clubwerchow/src/views/");

  app.use("/", routesCW);

  return app;
};

const appFactory2 = () => {
  const app = express();

  app.use(express.static(path.join(__dirname, "projects/public/")));
  app.use("/", routesSep);

  return app;
};

const appFactory3 = () => {
  const app = express();

  app.use(express.static(path.join(__dirname, "projects/public/")));
  app.use("/", routesGrup);

  return app;
};

// Domains
evh.register("clubwerchow.com", appFactory());
evh.register("sepelios.werchow.com", appFactory2());
evh.register("grupowerchow.com", appFactory3());

// Servers

app.use(evh.vhost(app.enabled("trust proxy")));

http.createServer(options, app).listen(httpPort, () => {
  console.log("http server listening on port " + httpPort);
});

https.createServer(options, app).listen(httpsPort, () => {
  console.log("https server listening on port " + httpsPort);
});
