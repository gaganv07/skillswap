const path = require('path');
const routes = [
  './src/routes/authRoutes',
  './src/routes/aiRoutes',
  './src/routes/chatRoutes',
  './src/routes/groupRoutes',
  './src/routes/mediaRoutes',
  './src/routes/matchRoutes',
  './src/routes/notificationRoutes',
  './src/routes/requestRoutes',
  './src/routes/reviewRoutes',
  './src/routes/swapRoutes',
  './src/routes/userRoutes',
];

let failed = false;

routes.forEach(route => {
  try {
    require(path.resolve(__dirname, route));
    console.log(`OK: ${route}`);
  } catch (error) {
    console.error(`FAIL: ${route}`);
    console.error(error);
    failed = true;
  }
});

if (failed) {
  process.exit(1);
}
