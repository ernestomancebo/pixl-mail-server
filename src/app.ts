import { PersonContact } from './models/person-contact';
import { MailClient } from './mail-client';
import { ERROR_BAD_REQUEST_CODE } from './models/error-mapping';
import { ServiceResponse } from './models/service-response';
import { ResponseUtil } from './util/response-util';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as rateLimit from 'express-rate-limit';
import * as cors from 'cors';
import * as fs from 'fs';

const app = express();
let mailClient: MailClient = null;

app.use(cors());
app.use(bodyParser.json());

app.post("/mail", function (req, res, next) {
  let response: ServiceResponse = null;
  let contactBody: PersonContact = req.body;

  if (PersonContact.isPersonContact(contactBody)) {
    // Handle valid request
    response = mailClient.sendMail(contactBody);
  } else {
    // Handle invalid request
    response = ResponseUtil.buildInvalidParametersResponse(contactBody);
    res.status(ERROR_BAD_REQUEST_CODE);
  }

  res.send(response);
});

app.get('/', function (request, response) {
  response.redirect('/status');
});

fs.readFile(`${process.cwd()}/config/config.json`, (err, buff) => {
  let statusMessage = "Everything is ok";
  let listenPort = process.env.PORT || 3000;

  if (err) {
    statusMessage = `Error starting up the server.\n${err}`;
    console.error(statusMessage);
  } else {
    try {
      const configObj = JSON.parse(buff.toString());

      listenPort = configObj.app.listenPort;
      mailClient = MailClient.setUp(configObj);

      const waitSeconds: number = configObj.app.requestLimiter.timeoutSec || 30;
      const mailRateLimiter = new rateLimit({
        windowMs: waitSeconds * 1000,
        max: configObj.app.requestLimiter.maxAttempts || 2,
        delay: 0,
        message: JSON.stringify(ResponseUtil.buildTooManyRequestsResponse(waitSeconds))
      });

      app.use('/mail', mailRateLimiter);
    } catch (err) {
      console.error(err);
      statusMessage = `Error setting up the configuration:\n${err}`;
    }
  }

  app.get('/status', (req, res) => {
    res.send(statusMessage);
  });

  app.listen(listenPort, function () {
    console.info(`Server started @ port ${listenPort}`);
  });

});
