import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  void req;

  const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  return sendSuccess(res, {
    message: 'Job Portal API is running.',
    data: {
      environment: process.env.NODE_ENV || 'development',
      database: databaseStates[mongoose.connection.readyState] || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
});

export default healthRouter;
