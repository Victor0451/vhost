const evh = require("express-vhost");
const express = require("express");
const exphbs = require("hbs");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const tls = require("tls");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
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

const secondContext = tls.createSecureContext({
  key: fs.readFileSync("certs/clubwerchow.key", "utf8"),
  cert: fs.readFileSync("certs/clubwerchow.cert", "utf8"),
});
const options = {
  key: fs.readFileSync("certs/werchow.key", "utf8"),
  cert: fs.readFileSync("certs/werchow.cert", "utf8"),
  SNICallback: function (domain, cb) {
    if (domain === "sepelios.werchow.com") {
      cb(null, secondContext);
    } else {
      cb();
    }
  },
};

// Routes
const routesCW = require("./routes/clubwerchow");
const routesSep = require("./routes/sepelios");

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

  app.use("/public", express.static(path.join(__dirname, "projects/public/")));
  app.use("/", routesSep);

  return app;
};

// Domains

evh.register("sepelios.werchow.com", appFactory2());
evh.register("clubwerchow.com", appFactory()); 

// Servers

app.use(evh.vhost(app.enabled("trust proxy")));

http.createServer(options, app).listen(httpPort, () => {
  console.log("http server listening on port " + httpPort);
});

https.createServer(options, app).listen(httpsPort, () => {
  console.log("https server listening on port " + httpsPort);
});
