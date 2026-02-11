export class ResendService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.apiKey) {
      console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
      return { success: true, id: 'mock_email_id' };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'LinkUp <noreply@link-up.live>',
          to,
          subject,
          html
        })
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (e) {
      console.error('Resend Error:', e);
      return { success: false, error: e };
    }
  }
}
