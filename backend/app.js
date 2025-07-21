const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();


const signInRouter = require('./router/signInRouter');
const signUpRouter = require('./router/signUpRouter');
const gweiRouter = require('./router/gweiRouter');
const verificationRouter = require('./router/verificationRouter');
const registrationRouter = require('./router/registrationRouter');
const votePageRouter = require('./router/votePageRouter');
const authenticateRouter = require('./router/authenticateRouter');
const tokenVerifyRouter = require('./authenticate/tokenVerificationRouter');
const publicClaimRouter = require('./ORACLE/routers/publicClaim');
const showUsernameRouter = require('./router/username');
const egcSaver = require('./ORACLE/routers/egcRouter');
const aclinkRouter = require('./router/acLinkRouter');


const app = express();

const allowedOrigins = [
  'http://localhost:5500', // local frontend
  'https://univote.tech',
  'http://localhost:3000', // local backend
  'https://univote-backend.onrender.com', // production backend
  'https://univote-gfvv.onrender.com',
  'https://localhost:52122'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1); // important for secure cookies behind proxies
}

app.use(session({
  secret: 'univote',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProduction,        // true only in production (HTTPS)
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax', // required for cross-site cookies in production
    maxAge: 1000 * 60 * 10       // 10 minutes
  }
}));


app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'scripts')));

app.use(gweiRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(verificationRouter);
app.use(registrationRouter);
app.use(votePageRouter)
app.use(authenticateRouter);
app.use(tokenVerifyRouter);
app.use(publicClaimRouter);
app.use(showUsernameRouter);
app.use(egcSaver);
app.use(aclinkRouter);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;"
  );
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT =  process.env.PORT || 3000;

const mongo_db = isProduction ? process.env.MONGODB_URI_PRODUCTION : process.env.MONGODB_URI_TESTING; 

mongoose.connect(mongo_db, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
  });
})

