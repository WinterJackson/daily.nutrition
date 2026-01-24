import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    // During build time, this might run without env vars. 
    // We handle this gracefully.
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing');
      // If this is hit during build, it just returns strict json. 
      // If hit during runtime, it creates an error response.
      // However, we only initialize Resend if we have a key.
      return NextResponse.json(
        { error: 'Server configuration error: Missing API Key' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Send email to the business
    const { data, error } = await resend.emails.send({
      from: 'Daily Nutrition <noreply@dailynutrition.com>',
      to: ['info@dailynutrition.com'],
      replyTo: email,
      subject: `New Inquiry: ${service || 'General'} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4A5D23 0%, #6B8E23 100%); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Consultation Inquiry</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 120px;">Name:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #4A5D23;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #6B8E23;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Service:</td>
                <td style="padding: 8px 0;">${service || 'General Inquiry'}</td>
              </tr>
            </table>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
              <p style="color: #374151; margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
              This inquiry was submitted via the Daily Nutrition website contact form.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Send confirmation email to the client
    await resend.emails.send({
      from: 'Daily Nutrition <noreply@dailynutrition.com>',
      to: [email],
      subject: 'Thank you for contacting Daily Nutrition',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4A5D23 0%, #6B8E23 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${name}!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; line-height: 1.6;">
              We have received your inquiry and will get back to you within 24-48 hours.
            </p>
            <p style="color: #374151; line-height: 1.6;">
              In the meantime, feel free to explore our services or follow us on social media for nutrition tips.
            </p>
            
            <div style="background: #FFF7ED; border: 1px solid #FDBA74; padding: 16px; border-radius: 8px; margin-top: 16px;">
              <p style="color: #C2410C; margin: 0; font-size: 14px;">
                <strong>Need urgent assistance?</strong><br/>
                Call us directly at <a href="tel:+254700000000" style="color: #C2410C;">+254 700 000 000</a>
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
              - The Daily Nutrition Team
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
