import * as adminEmployerService from '../services/adminEmployer.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getEmployers(req, res, next) {
  try {
    const { search, status, page, limit } = req.validatedQuery;
    const result = await adminEmployerService.getEmployers({ search, status, page, limit });

    sendSuccess(res, { statusCode: 200, message: 'Employers retrieved successfully.', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getEmployerById(req, res, next) {
  try {
    const { companyId } = req.validatedParams;
    const company = await adminEmployerService.getEmployerById(companyId);

    sendSuccess(res, { statusCode: 200, message: 'Employer details retrieved successfully.', data: { company } });
  } catch (error) {
    next(error);
  }
}

export async function updateVerificationStatus(req, res, next) {
  try {
    const { companyId } = req.validatedParams;
    const { status } = req.validatedBody;

    const company = await adminEmployerService.updateVerificationStatus(companyId, status);

    sendSuccess(res, { statusCode: 200, message: `Employer verification status updated to '${status}'.`, data: { company } });
  } catch (error) {
    next(error);
  }
}
