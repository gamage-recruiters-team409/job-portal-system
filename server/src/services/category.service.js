import Category from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getCategories() {
  const categories = await Category.find({ isActive: true })
    .select('-createdBy -createdAt -updatedAt -__v')
    .sort({ categoryName: 1 });
  return categories;
}

export async function getAllCategoriesAdmin() {
  const categories = await Category.find().sort({ createdAt: -1 });
  return categories;
}

export async function createCategory({ categoryName, description, createdBy }) {
  const existingCategory = await Category.findOne({
    categoryName: { $regex: new RegExp(`^${escapeRegex(categoryName)}$`, 'i') },
  });
  if (existingCategory) {
    throw new ApiError(409, 'Category already exists.');
  }

  const category = new Category({
    categoryName,
    description,
    createdBy,
  });

  await category.save();
  return category;
}

export async function updateCategory(id, { categoryName, description, isActive }) {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  if (categoryName) {
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
  return category;
}
