const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy requests to the RAG service
  app.use(
    '/chat',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      pathRewrite: {
        '^/chat': '/chat', // rewrite path
      },
      onError: (err, req, res) => {
        console.warn('RAG Service proxy error:', err);
        res.status(502).json({
          message: 'RAG Service temporarily unavailable',
          error: 'ECONNREFUSED'
        });
      }
    })
  );

  // Handle weather API requests with mock data when backend is unavailable
  app.use('/api/weather/current/:lat/:lon', (req, res) => {
    const baseTemp = Math.random() * 20 - 5; // -5°C to 15°C
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    // Mock weather data matching WeatherDashboard expectations
    res.json({
      location: "Zermatt",
      elevation: "1620m",
      current: {
        temperature: Math.round(baseTemp),
        condition: condition,
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 25 + 5), // 5-30 km/h
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        visibility: Math.round(Math.random() * 20 + 10), // 10-30 km
        pressure: Math.round(Math.random() * 50 + 980), // 980-1030 hPa
        feelsLike: Math.round(baseTemp - Math.random() * 5)
      },
      forecast: Array.from({ length: 24 }, (_, i) => ({
        hour: new Date(Date.now() + i * 60 * 60 * 1000).getHours(),
        temperature: Math.round(baseTemp + (Math.random() - 0.5) * 8),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        precipitation: Math.random() * 5
      })),
      risks: {
        avalanche: Math.random() > 0.7 ? 'moderate' : 'low',
        frost: baseTemp < 0 ? 'high' : 'low',
        visibility: Math.random() > 0.8 ? 'poor' : 'good',
        wind: Math.random() > 0.6 ? 'strong' : 'normal'
      }
    });
  });

  // Handle health checks
  app.use('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      services: {
        rag: true,
        weather: false,
        alerts: false
      }
    });
  });

  // Handle other API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      onError: (err, req, res) => {
        console.warn('API Gateway proxy error:', err);
        res.status(502).json({
          message: 'API service temporarily unavailable',
          error: 'ECONNREFUSED'
        });
      }
    })
  );
};