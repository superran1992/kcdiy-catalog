import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_5rJRXz2C_8X2bBoqs77P854WBD7mRVsaH');

export async function POST(request: Request) {
  const { customerName, customerEmail, cartItems, total } = await request.json();

  try {
    const data = await resend.emails.send({
      from: 'KC DIY <orders@kcdiy.live>', 
      to: ['charles.li_27@foxmail.com', customerEmail], 
      subject: `✨ Your Order Selection: ${customerName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 40px 20px; background-color: #FCFAF7; color: #2D2D2D;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 30px; border: 1px solid #F0F0F0;">
            <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 30px;">Order Summary</h1>
            
            <p style="font-size: 14px; margin-bottom: 10px;"><strong>Customer:</strong> ${customerName}</p>
            <p style="font-size: 14px; margin-bottom: 30px;"><strong>Email:</strong> ${customerEmail}</p>

            <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #A0A0A0; margin-bottom: 20px;">Selected Styles:</h3>
            
            ${cartItems.map((item: any) => {
              // 🛡️ 兼容性处理：优先取 image_url，备选 Image
              const img = item.image_url || item.Image;
              const id = item.id || item.ID;
              const style = item.style || item.Style;
              
              return `
              <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #FAFAFA;">
                <img src="${img}" width="100" style="border-radius: 8px; object-fit: cover; margin-right: 20px; border: 1px solid #EEE;" />
                <div style="flex: 1;">
                  <p style="margin: 0; font-size: 13px; font-weight: bold;">[${id}] ${style}</p>
                  <p style="margin: 0; font-size: 11px; color: #AAA;">Qty: ${item.qty} | $8.00</p>
                </div>
              </div>
            `}).join('')}

            <div style="margin-top: 40px; padding: 20px; background-color: #F9F9F9; border-radius: 20px; text-align: center;">
              <p style="font-size: 16px; font-weight: 900; margin: 0;">Total Amount: $${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      `
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}