const apiPort = process.env.LOOLOO_API_PORT || '3000';

module.exports = {
  '/api/**': {
    target: `http://localhost:${apiPort}`,
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  },
};
