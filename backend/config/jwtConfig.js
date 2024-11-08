module.exports = {
    secret: process.env.JWT_SECRET || 'your-default-secret-key',
    expiresIn: '24h',
  };