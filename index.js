require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let urlArr = [];

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  let found = urlArr.find((el) => el.original_url === url);
  if (found) {
    return res.json(found);
  }
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return res.json({
      error: "invalid url",
    });
  }
  const { hostname } = new URL(url);
  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({
        error: "invalid url",
      });
    }
    const newObj = { original_url: url, short_url: urlArr.length + 1 };
    urlArr.push(newObj);
    return res.json(newObj);
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = urlArr.find((el) => el.short_url === id);
  if (!found) {
    return res.json({ error: "No short URL found for the given input" });
  }
  res.redirect(found.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
