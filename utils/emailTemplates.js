const registrationAdminNotice = (name, email) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: #9F7AEA; padding: 30px; text-align: center; color: white; }
        .content { padding: 40px; color: #2d3748; line-height: 1.6; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; }
        .button { background: #F6AD55; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
        .info-box { background: #edf2f7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #9F7AEA; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">New Staff Registration</h1>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>A new staff member has just registered on <strong>Tea Spark</strong>. Please review their application in the dashboard.</p>
            <div class="info-box">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            </div>
            <p>You can approve or reject this request from your Admin Dashboard.</p>
            <a href="http://localhost:3000/admin-login" class="button">Visit Admin Portal</a>
        </div>
        <div class="footer">
            <p>&copy; 2026 Tea Spark Bakery. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const approvalStatusNotice = (name, status) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: ${status === 'approved' ? '#9F7AEA' : '#FC8181'}; padding: 30px; text-align: center; color: white; }
        .content { padding: 40px; color: #2d3748; line-height: 1.6; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; }
        .status-badge { display: inline-block; padding: 8px 15px; border-radius: 20px; font-weight: bold; background: ${status === 'approved' ? '#C6F6D5' : '#FED7D7'}; color: ${status === 'approved' ? '#22543D' : '#822727'}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Tea Spark | Application Update</h1>
        </div>
        <div class="content">
            <p>Hello ${name},</p>
            <p>We've processed your application to join the <strong>Tea Spark</strong> family as a staff member.</p>
            <div class="status-badge">${status}</div>
            <p>
                ${status === 'approved'
        ? "Welcome aboard! Your account is now active. You can log in to view your responsibilities and manage your profile."
        : "After careful consideration, we regret to inform you that your application has been rejected at this time. Thank you for your interest in Tea Spark."}
            </p>
            ${status === 'approved' ? '<a href="http://localhost:3000/login" style="background: #F6AD55; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px;">Log In Now</a>' : ''}
        </div>
        <div class="footer">
            <p>&copy; 2026 Tea Spark Bakery. Hand-baked with love.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    registrationAdminNotice,
    approvalStatusNotice
};
