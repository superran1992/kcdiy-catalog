const testEmail = async () => {
  const apiUrl = 'http://localhost:3000/api/send'; // 如果是线上请改为你的域名地址
  const payload = {
    customerName: "Test Admin",
    customerEmail: "charles.li_27@foxmail.com",
    total: 8.00,
    cartItems: [
      {
        id: "M001",
        style: "Test Style",
        qty: 1,
        image_url: "https://yrmwhrpwzehgoebkkrkb.supabase.co/storage/v1/object/public/product-images/M001.jpg"
      }
    ]
  };

  console.log("正在发送测试请求...");
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("收到响应:", data);
  } catch (err) {
    console.error("请求失败，请确保你的本地服务已启动:", err.message);
  }
};

testEmail();