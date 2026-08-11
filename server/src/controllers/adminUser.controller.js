import * as adminUserService from '../services/adminUser.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getUsers(req, res, next) {
  try {
    const { search, status, role, page, limit } = req.validatedQuery || req.query;

    const result = await adminUserService.getUsers({ search, status, role, page, limit });

    return sendSuccess(res, {
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { userId } = req.validatedParams || req.params;

    const user = await adminUserService.getUserById(userId);

    return sendSuccess(res, {
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.validatedBody || req.body;

    const user = await adminUserService.createUser({ name, email, password, role });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { userId } = req.validatedParams || req.params;
    const { name, email, role } = req.validatedBody || req.body;

    const user = await adminUserService.updateUser(userId, { name, email, role });

    return sendSuccess(res, {
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { userId } = req.validatedParams || req.params;
    const { status } = req.validatedBody || req.body;

    const user = await adminUserService.updateUserStatus(userId, status, req.user._id);

    return sendSuccess(res, {
      message: `User status changed to ${status} successfully`,
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserStats(req, res, next) {
  try {
    const stats = await adminUserService.getUserStats();

    return sendSuccess(res, {
      message: 'User statistics retrieved successfully',
      data: { stats },
    });
  } catch (error) {
    return next(error);
  }
}
