export class PersonContact {
  name: string;
  email: string;
  phone: string;
  message: string;
  app: string;
  destination?: string[];

  public static isPersonContact(obj: any): string {
    const requiredProperties = [
      'name',
      'email',
      'phone',
      'message',
      'app'
    ];

    let missingParameter = null;
    for (let prop of requiredProperties) {
      if (!obj.hasOwnProperty(prop)) {
        missingParameter = prop;
      }
    }

    return missingParameter;
  }
}

export interface MailInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  clientApp: string;
}
