const VerificationEmail = (username, otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .header {
        background: #4f46e5;
        color: #fff;
        padding: 15px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .content {
        padding: 20px;
        text-align: center;
      }
      .otp {
        font-size: 28px;
        font-weight: bold;
        color: #4f46e5;
        margin: 20px 0;
        letter-spacing: 4px;
      }
      .footer {
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Email Verification</h2>
      </div>
      <div class="content">
        <p>Hello <strong>${username}</strong>,</p>
        <p>Use the OTP below to verify your email:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <div class="footer">
        &copy; 2025 Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

export default VerificationEmail;
