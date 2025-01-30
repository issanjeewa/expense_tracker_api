import { registerAs } from '@nestjs/config';

type EmailConfig = {
  smtpServer: string;
  smtpUser: string;
  smtpPassword: string;
  smtpPort: number;
  fromEmail: string;
};

export default registerAs<EmailConfig>('email', () => ({
  smtpServer: process.env.SMTP_SERVER,
  smtpPort: parseInt(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  fromEmail: process.env.EMAIL_FROM,
}));
