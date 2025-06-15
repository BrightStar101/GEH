const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const loadConfig = require('./config/config');
const { errorHandler } = require('./middleware/errorMiddleware');

const {initializeBaraza} = require('./agents/barazaAgent');
const { initializeDriftMonitor } = require('./agents/driftMonitorAgent');
const {initializeBiasMonitor} = require('./agents/biasMonitorAgent');
const {initializeHallucinationMitigator} = require('./agents/hallucinationMitigator');

const auditRoutes = require('./routes/auditRoutes');
const authRoutes = require('./routes/authRoutes');
const downloadRoutes = require('./routes/downLoadRoutes');
const formRoutes = require('./routes/formRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const seoRoutes = require('./routes/seoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userTierRoutes = require('./routes/userTierRouter');
const chatRoutes = require('./routes/chatRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const paypalRoutes = require('./routes/paypalRoutes');

const { preloadCommonSecrets } = require('./config/gcpSecrets');
const connectDB = require('./config/db');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.use('/api/stripe', stripeRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/healthz', (req, res) => res.status(200).send('OK'));

app.use('/api/audit', auditRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/download', downloadRoutes)
app.use('/api/form', formRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userTierRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/admin-impact', require('./routes/adminImpactRoutes')); // ✅ Admin Impact Dashboard

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


// Global fallback route for unmatched endpoints
// app.use('*', (req, res) => {
//   res.status(404).json({ success: false, message: 'API route not found.' });
// });

app.use(errorHandler);

initializeBaraza();
initializeDriftMonitor();
initializeBiasMonitor();
initializeHallucinationMitigator();

(async () => {
  try {
    await connectDB();

    console.log('🔐 Preloading secrets...');
    // await preloadCommonSecrets();
    console.log('📦 Loading secure config...');
    let config;
    try {
      config = await loadConfig();
      console.log('✅ Config successfully loaded.');
    } catch (err) {
      console.error('❌ loadConfig() failed:', err);
      process.exit(1);
    }

    const PORT = process.env.PORT || 8080;
    app.get('/', (req, res) => res.status(200).send('GEH backend is alive'));
    app.listen(PORT, () => {
      console.log(`🚀 GEH backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Fatal startup error:', err.message);
    process.exit(1);
  }
})();
