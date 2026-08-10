import * as categoryService from '../services/category.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategories();
    return sendSuccess(res, {
      message: 'Categories retrieved successfully',
      data: { categories },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAllCategoriesAdmin(req, res, next) {
  try {
    const categories = await categoryService.getAllCategoriesAdmin();
    return sendSuccess(res, {
      message: 'All categories retrieved successfully',
      data: { categories },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { categoryName, description } = req.body;
    const createdBy = req.user._id;

    const category = await categoryService.createCategory({
      categoryName,
      description,
      createdBy,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { categoryName, description, isActive } = req.body;

    const category = await categoryService.updateCategory(id, {
      categoryName,
      description,
      isActive,
    });

    return sendSuccess(res, {
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
}
