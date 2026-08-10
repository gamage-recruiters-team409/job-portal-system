import * as skillService from '../services/skill.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getSkills(req, res, next) {
  try {
    const { categoryId } = req.query;
    const query = { isActive: true };
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const skills = await skillService.getSkills(query);

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
    const skills = await skillService.getAllSkillsAdmin();
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
    const createdBy = req.user._id;

    const skill = await skillService.createSkill({
      skillName,
      categoryId,
      createdBy,
    });

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

    const skill = await skillService.updateSkill(id, {
      skillName,
      categoryId,
      isActive,
    });

    return sendSuccess(res, {
      message: 'Skill updated successfully',
      data: { skill },
    });
  } catch (error) {
    return next(error);
  }
}
