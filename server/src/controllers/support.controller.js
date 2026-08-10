import { createSupport } from '../services/support.service.js';

export const createSupportMessage = async (req, res, next) => {
  try {
    await createSupport(req.body);

    res.status(201).json({
      success: true,
      message: 'Support message submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};
