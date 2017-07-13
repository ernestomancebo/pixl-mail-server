export interface PersonContact {
  name: string;
  email: string;
  phone: string;
  message: string;
  destination?: string[];
}

export interface MailInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  clientApp: string;
}
