export class PersonContact {
  name: string;
  email: string;
  phone: string;
  message: string;
  app: string;
  destination?: string[];

  public static isPersonContact(obj: any): boolean {
    const requiredProperties = [
      'name',
      'email',
      'phone',
      'message'
    ];

    requiredProperties.forEach((prop) => {
      if (!obj.hasOwnProperty(prop)) {
        return false;
      }
    });

    return true;
  }
}

export interface MailInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  clientApp: string;
}
