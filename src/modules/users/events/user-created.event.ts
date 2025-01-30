export class UserCreatedEvent {
  email: string;
  name: string;
  verificationToken: string;

  constructor(email: string, name: string, verificationToken: string) {
    this.email = email;
    this.name = name;
    this.verificationToken = verificationToken;
  }
}
