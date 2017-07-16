import { MailOptions } from './models/mail-options';
import { PersonContact } from './models/person-contact';
import { ServiceResponse } from './models/service-response';
import { ResponseUtil } from './util/response-util';
import { SmtpOptions } from 'nodemailer-smtp-transport';
import * as nodemailer from 'nodemailer';
import * as https from 'https';
import * as querystring from 'querystring';

export class MailClient {
  private smtpSchema: SMTPSchema = null;
  private httpMailSchema: HTTPMailSchema = null;
  private mailTransporter: nodemailer.Transporter = null;
  private static usesSMTP: boolean = false;
  private static destinations: any[] = [];

  private constructor() {
  }

  public sendMail(personContact: PersonContact): ServiceResponse {
    const me = this;
    const htmlMail: string = me.buildHTMLMail(personContact);
    let destinataries: string[] = [];
    let mailProcessingResponse: ServiceResponse = ResponseUtil.buildSuccessResponse();

    MailClient.destinations.forEach((destinations) => {
      if (destinations.app == personContact.app) {
        destinations.destinataries.forEach((destinataryEntry) => {
          destinataries.push(destinataryEntry);
        });
      }
    });

    let destinatariesCsv = me.buildCsvFromArray(destinataries);

    if (MailClient.usesSMTP) {
      try {
        me.buildMailTransporter();

        const mailOptions: nodemailer.SendMailOptions = {
          from: `${personContact.name} <${personContact.email}>`,
          to: destinatariesCsv,
          subject: `Contact from ${personContact.name} @ personal page`,
          html: htmlMail
        }
        me.mailTransporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.error(`Something went wrong sending the mail:\n${err}`);
          } else if (info && info.rejected.length > 0) {
            console.warn(`There were rejected messages: ${JSON.stringify(info.rejected)}`);
          } else {
            console.info(`Mail sent: ${info.response}`)
          }
        });
      } catch (err) {
        mailProcessingResponse = ResponseUtil.buildProcessingErrorResponse(err);
      }
      me.mailTransporter.close();
    } else {
      const sendMailData = querystring.stringify({
        'from': personContact.email,
        'to': destinatariesCsv,
        'html': htmlMail
      });

      const postHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(sendMailData)
      };

      const postOptions: https.RequestOptions = {
        method: 'POST',
        hostname: `api:${me.httpMailSchema.apiKey}@${me.httpMailSchema.apiHost}`,
        path: `/${me.httpMailSchema.path}`,
        auth: ``,
        headers: postHeaders
      };

      const req = https.request(postOptions, (res: https.IncomingMessage) => {
        res.setEncoding('utf8');

        res.on('data', (chunk: string) => {
          console.log(`chunk response ${chunk}`);
        });
      });

      req.on('error', (err) => {
        console.error(err);
      })
    }

    return mailProcessingResponse;
  }

  private buildMailTransporter(): void {
    const me = this;
    const SMTP_URI = `${me.smtpSchema.protocol}://${me.smtpSchema.account}:${me.smtpSchema.accountPass}@${me.smtpSchema.host}`;
    me.mailTransporter = nodemailer.createTransport(SMTP_URI);
  }

  private buildHTMLMail(personContact: PersonContact): string {
    const htmlMail: string = `
    <h1>${personContact.name} wants to contact you</h1><br/>
    <h2><p>Wrote:<br/>${personContact.message}</p></h2><br/>
    <h3>The email is: ${personContact.email}</h3><br/>
    <h3>The phone is: ${personContact.phone}</h3><br/>
    `;

    return htmlMail
  }

  private buildCsvFromArray(inputArray: any[]): string {
    let csv: string = "";

    if (inputArray && inputArray.length > 0) {
      csv = csv.concat(inputArray.pop());
      if (inputArray.length > 0) {
        do {
          csv = csv.concat(",");
          csv = csv.concat(inputArray.pop());
        } while (inputArray.length > 0);
      }
    }
    return csv;
  }

  private static isConfigurationValid(configObj: any): void {
    const me = this;
    if (configObj.useSmtp) {
      me.checkSmtpConfig(configObj);
    } else {
      me.checkHttpMailConfig(configObj);
    }

    me.checkDestinationsConf(configObj);
  }

  private static checkSmtpConfig(configObj: any): void {
    if (!configObj.mail) {
      throw new Error("Property 'mail' not present at configuration file");
    }

    const requiredProperties = ['host', 'account', 'accountPass']
    const mailConfig = configObj.mail;

    requiredProperties.forEach((requiredProperty) => {
      if (!!!mailConfig[requiredProperty]) {
        throw new Error(`Property '${requiredProperty}' is missing at mail object on configuration file`);
      }
    });
  }

  private static checkHttpMailConfig(configObj: any): void {
    // these are the required params by mailgun
    if (!configObj.httpMail) {
      throw new Error("Property 'httpMail' not present at configuration file");
    }

    const requiredProperties = ['apiKey', 'apiHost', 'path']
    const httpMail = configObj.httpMail;

    requiredProperties.forEach((requiredProperty) => {
      if (!!!httpMail[requiredProperty]) {
        throw new Error(`Property '${requiredProperty}' is missing at httpMail object on configuration file`);
      }
    });
  }

  private static checkDestinationsConf(configObj: any): void {
    if (!configObj.destinations) {
      throw new Error("Property 'destinations' not present at configuration file");
    }

    if (!(configObj.destinations instanceof Array) || configObj.destinations.length < 1) {
      throw new Error("Property 'destinations' is not an array or has no entries");
    }

    configObj.destinations.forEach((entry) => {
      if (!!!entry['app'] || !!!entry['destinataries']) {
        throw new Error("Property 'destinations' has a malformed entry");
      }
    });

  }

  public static setUp(configObj: any): MailClient {
    const me = this;
    const mailInstance: MailClient = new MailClient();

    me.isConfigurationValid(configObj);
    me.usesSMTP = configObj.useSmtp;
    me.destinations = configObj.destinations;

    console.info(`setting up configuration, using ${me.usesSMTP ? 'SMTP' : 'HTTP'} mail client`);
    if (me.usesSMTP) {
      const mailConfig = configObj.mail;

      mailInstance.smtpSchema = {
        protocol: mailConfig.protocol || 'smtp',
        host: mailConfig.host,
        port: mailConfig.port || 25,
        secure: mailConfig.secure || false,
        account: mailConfig.account,
        accountPass: mailConfig.accountPass,
        service: mailConfig.service
      }

      console.info(`SMTP config: ${JSON.stringify(mailInstance.smtpSchema)}`);
    } else {
      const httpMailConfig = configObj.httpMail;

      mailInstance.httpMailSchema = {
        apiKey: httpMailConfig.apiKey,
        apiHost: httpMailConfig.apiHost,
        path: httpMailConfig.path
      }

      console.info(`HTTP config: ${JSON.stringify(mailInstance.httpMailSchema)}`);
    }

    return mailInstance;
  }

}

interface SMTPSchema {
  protocol: string;
  host: string;
  port: number;
  secure: boolean;
  account: string;
  accountPass: string;
  service?: string;
}

interface HTTPMailSchema {
  apiKey: string;
  apiHost: string;
  path: string;
}
