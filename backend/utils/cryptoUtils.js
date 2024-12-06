const crypto = require("crypto");

function generateSignature(fiUsername, userUsername, data) {
    const privateKey = `${fiUsername}${userUsername}`;
    const hmac = crypto.createHmac('sha256', privateKey);
    hmac.update(data);
    return hmac.digest('hex');
}

function verifySignature(fiusername, userUsername, verificationId, signature) {
    const publicKey = `${fiusername}${userUsername}`; // Matches privateKey used in first snippet
    const hmac = crypto.createHmac('sha256', publicKey);
    hmac.update(verificationId); // Consistent with signature logic in the first snippet
    const expectedSignature = hmac.digest('hex');
    return expectedSignature === signature;
  }
  

module.exports = { generateSignature, verifySignature };
