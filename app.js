var express = require("express");
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');

var app = express();
var port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post("/mail/:person", function (req, res, next) {

    switch (req.params.person) {
        case 'ernesto':
        response = mailToErnesto(req.body);
        break;
        default:
        // do the corresponding
        response = buildResponse();
        break;
    }

    res.send(response);

});

app.get("/ping", function (req, res) {
    res.send("pong");
});

/*
Sends a mail to ernesmancebo@gmail.com
*/
var mailToErnesto = function (params) {
    var person = {};

    person.name        = params.name;
    person.email       = params.email;
    person.phone       = params.phone;
    person.message     = params.message;
    person.destination = "ernesmancebo@gmail.com";

    console.log(person);
    return buildMessageToErnesto(person);
};

var buildMessageToErnesto = function (person) {
    console.log(person);
    return sendMail(person);
};

var sendMail = function (person) {
    var me = this;

    me.user = 'postmaster@sandboxbb9cd8eede1b4371acea54621c16c420.mailgun.org';
    me.pass = '32d79912d28a8b02f5ab8ef6c12c60e3';
    var transporter = nodemailer.createTransport('smtps://'+user+':'+pass+'@smtp.mailgun.org');

    var msg = '';
    msg += "<h1>"+person.name +" wants to contact you</h1>\n";
    msg += "<h2><p>Wrote:\n"+person.message+"</p></h2>\n";
    msg += "<h3>The email is: "+person.email+"</h3>\n";
    msg += "<h3>The phone is: "+person.phone+"</h3>\n";

    var mailOptions = {
        from: user,
        to: person.destination,
        subject:'Contact from ' + person.name,
        text: '',
        html: msg
    };

    console.log(mailOptions);

    var response = buildResponse();

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
        success: true
        , msg: (msg !== null && msg !== undefined)? msg: ""
        , statusCode: 200
    };
};

app.listen(port, function () {
    console.log('Server started @ port ' + port);
});