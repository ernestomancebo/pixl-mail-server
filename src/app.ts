import { PersonContact } from './models/person-contact';
import { MailClient } from './mail-client';
import { ServiceResponse } from './models/service-response';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ERROR_INVALID, ErrorMap } from './models/error-mapping';

var app = express();
var port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post("/mail", function (req, res, next) {
  var response = {};
  const reqBody = req.body;

  if (reqBody && [].indexOf(reqBody.who) > -1) {
    // Handle valid request
  } else {
    // Handle invalid request
    response = buildInvalidParametersRespone();
  }

  res.send(response);
});

app.get("/ping", function (req, res) {
  res.send("pong");
});

app.get('/', function (request, response) {
  var result = 'App is running'
  response.send(result);
});

/*
Sends a mail to ernesmancebo@gmail.com
*/
var doMail = function (params) {
  var person: PersonContact = {
    name: params.name,
    email: params.email,
    phone: params.phone,
    message: params.message,
    destination: [""]
  }
  return sendMail(person);
};

var sendMail = function (person) {
  var me = this;

  me.user = '';
  me.pass = '';
  var transporter = undefined; // nodemailer.createTransport('smtps://' + me.user + ':' + me.pass + '@smtp.mailgun.org');

  var msg = '';
  msg += "<h1>" + person.name + " wants to contact you</h1>\n";
  msg += "<h2><p>Wrote:\n" + person.message + "</p></h2>\n";
  msg += "<h3>The email is: " + person.email + "</h3>\n";
  msg += "<h3>The phone is: " + person.phone + "</h3>\n";

  var mailOptions = {
    from: me.user,
    to: person.destination,
    subject: 'Contact from ' + person.name,
    text: '',
    html: msg
  };

  console.log(mailOptions);

  var response = buildResponse({});

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log('Something went wrong:\n' + err);

      response = buildResponse(err);
      response.success = false;
      response.statusCode = 500;
    }

    if (info) {
      console.log('Message sent: ' + info.response);
    }
  });

  return response;
};

/*
The response message object
*/
var buildResponse = function (msg) {
  return {
    success: true,
    msg: (msg !== null && msg !== undefined) ? msg : "",
    statusCode: 200
  };
};
const buildInvalidParametersRespone = (): ServiceResponse => {
  let response: ServiceResponse = {
    success: false,
    message: ERROR_INVALID.errorDescription,
    statusCode: ERROR_INVALID.errorCode,
    errorList: [
      `${ERROR_INVALID.errorCode}: ${ERROR_INVALID.errorDescription}`
    ]
  };

  return response;
}
app.listen(process.env.PORT || port, function () {
  console.log('Server started @ port ' + port);
});
