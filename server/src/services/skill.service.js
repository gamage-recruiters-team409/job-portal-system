import Skill from '../models/Skill.js';
import Category from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getSkills(query) {
  const skills = await Skill.find(query)
    .select('-createdBy -createdAt -updatedAt -__v')
    .sort({ skillName: 1 })
    .populate('categoryId', 'categoryName');
  return skills;
}

export async function getAllSkillsAdmin() {
  const skills = await Skill.find().sort({ createdAt: -1 }).populate('categoryId', 'categoryName');
  return skills;
}

export async function createSkill({ skillName, categoryId, createdBy }) {
  const existingSkill = await Skill.findOne({
    skillName: { $regex: new RegExp(`^${escapeRegex(skillName)}$`, 'i') },
  });
  if (existingSkill) {
    throw new ApiError(409, 'Skill already exists.');
  }

  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new ApiError(404, 'Referenced Category not found.');
    }
  }

  const skill = new Skill({
    skillName,
    categoryId: categoryId || null,
    createdBy,
  });

  await skill.save();
  return skill;
}

export async function updateSkill(id, { skillName, categoryId, isActive }) {
  const skill = await Skill.findById(id);
  if (!skill) {
    throw new ApiError(404, 'Skill not found.');
  }

  if (skillName) {
    const existing = await Skill.findOne({
      skillName: { $regex: new RegExp(`^${escapeRegex(skillName)}$`, 'i') },
      _id: { $ne: id },
    });
    if (existing) {
      throw new ApiError(409, 'Another skill with this name already exists.');
    }
    skill.skillName = skillName;
  }

  if (categoryId !== undefined) {
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        throw new ApiError(404, 'Referenced Category not found.');
      }
    }
    skill.categoryId = categoryId || null;
  }

  if (isActive !== undefined) skill.isActive = isActive;

  await skill.save();
  return skill;
}
