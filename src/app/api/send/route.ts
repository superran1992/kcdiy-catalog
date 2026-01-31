import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// 🔑 API Key 严格保持不变
const resend = new Resend('re_5rJRXz2C_8X2bBoqs77P854WBD7mRVsaH');

export async function POST(request: Request) {
  const { customerName, customerEmail, cartItems, total } = await request.json();

  try {
    const data = await resend.emails.send({
      // 🚀 使用你验证成功的域名发信
      from: 'KC DIY <orders@kcdiy.live>', 
      // 🚀 同时发送给你和客户
      to: ['charles.li_27@foxmail.com', customerEmail], 
      subject: `✨ Your Order Selection: ${customerName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #FCFAF7; color: #2D2D2D;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 30px; border: 1px solid #F0F0F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h1 style="font-size: 22px; font-weight: 900; text-align: center; margin-bottom: 10px;">ORDER CONFIRMATION</h1>
            <p style="text-align: center; color: #A0A0A0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 40px;">Hi ${customerName}, here is your selection</p>
            
            <div style="border-bottom: 1px solid #F5F5F5; padding-bottom: 20px; margin-bottom: 30px;">
              <p style="margin: 5px 0; font-size: 13px;"><strong>Customer Contact:</strong> ${customerEmail}</p>
              <p style="margin: 5px 0; font-size: 13px;"><strong>Total Amount:</strong> <span style="color: #10B981; font-weight: bold;">$${total.toFixed(2)}</span></p>
            </div>

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; color: #888;">Selected Styles:</h3>
            
            ${/* 🖼️ 循环渲染每一款图片和详情 */ 
              cartItems.map((item: any) => `
              <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #FAFAFA;">
                <img src="${item.Image}" width="80" height="34" style="border-radius: 8px; object-fit: cover; margin-right: 20px; border: 1px solid #EEE;" />
                <div style="flex: 1;">
                  <p style="margin: 0; font-size: 13px; font-weight: bold;">${item.ID} - ${item.Style}</p>
                  <p style="margin: 0; font-size: 11px; color: #AAA;">Qty: ${item.qty} | $8.00 each</p>
                </div>
              </div>
            `).join('')}

            <div style="margin-top: 40px; padding: 20px; background-color: #F9F9F9; border-radius: 20px; text-align: center;">
              <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Ready to complete your order?</p>
              <p style="font-size: 11px; color: #888;">Please ensure you've completed the payment on our official site.</p>
            </div>

            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 10px; color: #CCC; text-transform: uppercase;">KC DIY Boutique Service</p>
            </div>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}