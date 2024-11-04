const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
app.use(express.static("public"));
require("dotenv").config();
const api_id = process.env.api_key;
const session = require("express-session");

app.use(
  session({
    secret: "justinbieber",
    resave: false,
    saveUninitialized: true,
  })
);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  req.session.firstName = req.body.first_name;
  req.session.lastName = req.body.last_name;
  req.session.email = req.body.email;

  res.redirect(`/additionalDetails.html`);
});
app.get("/additionalDetails.html", (req, res) => {
  res.sendFile(__dirname + "/public/additionalDetails.html");
});
app.post("/aman", (req, res) => {
  var street = req.body.street;
  var city = req.body.city;
  var state = req.body.state;
  var pin_code = req.body.pin_code;
  var country = req.body.country;
  var phone = req.body.phone;
  var dob = req.body.dob;
  var address = `${street},${city},${state},${pin_code},${country}`;
  const data = {
    members: [
      {
        email_address: req.session.email,
        status: "subscribed",
        merge_fields: {
          FNAME: req.session.firstName,
          LNAME: req.session.lastName,
          ADDRESS: address,
          PHONE: phone,
          BIRTHDAY: dob,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(data);
  const listId = process.env.list_id;
  const options = {
    method: "POST",
    auth: `AmanKumar:${api_id}`,
  };
  const url = `https://us11.api.mailchimp.com/3.0/lists/${listId}`;
  const request = https.request(url, options, (response) => {
    let responseData = "";
    response.on("data", (chunk) => {
      responseData += chunk;
    });

    response.on("end", () => {
      const jsonResponse = JSON.parse(responseData);
      if (response.statusCode === 200 && jsonResponse.errors.length === 0) {
        res.sendFile(__dirname + "/public/success.html");
      } else {
        console.log("Errors:", jsonResponse.errors);
        res.sendFile(__dirname + "/public/failure.html");
      }
    });
  });
  request.write(jsonData);
  request.end();
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.post("/success", (req, res) => {
  res.redirect("https://www.instagram.com/thisisaman408");
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});

//list id
//8764b5ae69
