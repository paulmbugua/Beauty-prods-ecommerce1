import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import { morganMiddleware, helmetMiddleware, limiter, logger } from './middleware/middleware.js'

// App Config
const app = express()
const port = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';




// Connect to Database and Cloudinary
connectDB()
connectCloudinary()

// Define Allowed Origins for CORS
const allowedOrigins = isProduction
  ? [
      process.env.PROD_BACKEND_URL,
      'https://admin.evertruecosmetics.co.ke',
      'https://evertruecosmetics.co.ke',
    ]
  : [
      process.env.BACKEND_URL,
      'http://localhost:5174',
      'http://localhost:5173',
    ];

    if (isProduction) {
        app.use((req, res, next) => {
            if (req.headers['x-forwarded-proto'] !== 'https') {
                return res.redirect(`https://${req.headers.host}${req.url}`);
            }
            next();
        });
    }
    // Middlewares
app.use(limiter)                    // Apply rate limiting
app.use(helmetMiddleware)           // Set secure HTTP headers
app.use(morganMiddleware)           // Log HTTP requests


app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json())             // Parse JSON bodies


// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

// Root Endpoint
app.get('/', (req, res) => {
    res.send("API Working")
})

// 404 Handler for Undefined Routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route Not Found' })
})

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.stack) // Log the error
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).json({ message: 'Internal Server Error' })
})

app.set('trust proxy', true);

// Start Server
app.listen(port, () => console.log('Server started on PORT : ' + port))
