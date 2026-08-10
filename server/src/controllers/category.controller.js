import Category from '../models/Category.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true })
      .select('-createdBy -createdAt -updatedAt -__v')
      .sort({ categoryName: 1 });
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
    const categories = await Category.find().sort({ createdAt: -1 });
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
    const adminId = req.user._id;

    if (!categoryName) {
      throw new ApiError(400, 'Category name is required.');
    }

    const existingCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${escapeRegex(categoryName)}$`, 'i') },
    });
    if (existingCategory) {
      throw new ApiError(409, 'Category already exists.');
    }

    const category = new Category({
      categoryName,
      description,
      createdBy: adminId,
    });

    await category.save();

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

    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found.');
    }

    if (categoryName) {
      // Check for uniqueness excluding current category
      const existing = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${escapeRegex(categoryName)}$`, 'i') },
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, 'Another category with this name already exists.');
      }
      category.categoryName = categoryName;
    }

    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return sendSuccess(res, {
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
}
