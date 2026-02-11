import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_5rJRXz2C_8X2bBoqs77P854WBD7mRVsaH');

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, cartItems, total } = await request.json();
    
    // 关键调试行：在部署后的日志中检查这里
    console.log("Incoming Cart Items:", JSON.stringify(cartItems));

    const data = await resend.emails.send({
      from: 'KC DIY <orders@kcdiy.live>', 
      to: ['charles.li_27@foxmail.com', customerEmail], 
      subject: `✨ Your Order Selection: ${customerName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #FCFAF7;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #EEE;">
            <h2 style="color: #2D2D2D; border-bottom: 2px solid #F0F0F0; padding-bottom: 10px;">Order Summary</h2>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>

            <div style="margin-top: 20px;">
              ${cartItems.map((item: any) => {
                // --- 补丁开始：提取变量并做兼容处理 ---
                const img = item.image_url || item.Image;
                const id = item.id || item.ID;
                const style = item.style || item.Style;
                // --- 补丁结束 ---

                return `
                <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #FAFAFA;">
                  <img src="${img}" width="100" style="border-radius: 8px; object-fit: cover; margin-right: 20px; border: 1px solid #EEE;" />
                  <div style="flex: 1;">
                    <p style="margin: 0; font-size: 13px; font-weight: bold;">[${id}] ${style}</p>
                    <p style="margin: 0; font-size: 11px; color: #AAA;">Qty: ${item.qty} | $8.00</p>
                  </div>
                </div>
              `;}).join('')}
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #F9F9F9; border-radius: 12px; text-align: center;">
              <p style="font-weight: bold; font-size: 16px; margin: 0;">Total Amount: $${Number(total).toFixed(2)}</p>
            </div>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}