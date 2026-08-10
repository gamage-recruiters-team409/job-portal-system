import Skill from '../models/Skill.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getSkills(req, res, next) {
  try {
    const { categoryId } = req.query;
    const query = { isActive: true };
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const skills = await Skill.find(query)
      .select('-createdBy -createdAt -updatedAt -__v')
      .sort({ skillName: 1 })
      .populate('categoryId', 'categoryName');

    return sendSuccess(res, {
      message: 'Skills retrieved successfully',
      data: { skills },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAllSkillsAdmin(req, res, next) {
  try {
    const skills = await Skill.find()
      .sort({ createdAt: -1 })
      .populate('categoryId', 'categoryName');
    return sendSuccess(res, {
      message: 'All skills retrieved successfully',
      data: { skills },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createSkill(req, res, next) {
  try {
    const { skillName, categoryId } = req.body;
    const adminId = req.user._id;

    if (!skillName) {
      throw new ApiError(400, 'Skill name is required.');
    }

    const existingSkill = await Skill.findOne({
      skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
    });
    if (existingSkill) {
      throw new ApiError(409, 'Skill already exists.');
    }

    const skill = new Skill({
      skillName,
      categoryId: categoryId || null,
      createdBy: adminId,
    });

    await skill.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Skill created successfully',
      data: { skill },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateSkill(req, res, next) {
  try {
    const { id } = req.params;
    const { skillName, categoryId, isActive } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      throw new ApiError(404, 'Skill not found.');
    }

    if (skillName) {
      const existing = await Skill.findOne({
        skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, 'Another skill with this name already exists.');
      }
      skill.skillName = skillName;
    }

    if (categoryId !== undefined) skill.categoryId = categoryId || null;
    if (isActive !== undefined) skill.isActive = isActive;

    await skill.save();

    return sendSuccess(res, {
      message: 'Skill updated successfully',
      data: { skill },
    });
  } catch (error) {
    return next(error);
  }
}
