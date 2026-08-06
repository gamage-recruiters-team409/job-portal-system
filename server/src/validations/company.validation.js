import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const companySchema = z.object({
  companyName: z
    .string({ message: 'Company name is required' })
    .trim()
    .min(3, 'Company name must be at least 3 characters')
    .max(100, 'Company name cannot exceed 100 characters'),
  companyEmail: z
    .string({ message: 'Company email is required' })
    .trim()
    .email('Invalid company email address'),
  companyTelephone: z
    .string({ message: 'Company telephone is required' })
    .trim()
    .min(1, 'Company telephone is required'),
  industry: z.string({ message: 'Industry is required' }).trim().min(1, 'Industry is required'),
  companySize: z.enum(['1-10', '11-50', '51-200', '200+'], {
    message: 'Company size is required',
  }),
  companyAddress: z
    .string({ message: 'Company address is required' })
    .trim()
    .min(1, 'Company address is required'),
  companyLocation: z
    .string({ message: 'Company location is required' })
    .trim()
    .min(1, 'Company location is required'),
  website: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().trim().url('Invalid URL format').optional()
  ),
  companyDescription: z
    .string()
    .trim()
    .max(500, 'Company description cannot exceed 500 characters')
    .optional()
    .nullable(),
  foundedYear: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({ message: 'Founded year must be a number' })
      .int('Founded year must be an integer')
      .min(1900, 'Founded year must be 1900 or later')
      .max(currentYear, `Founded year cannot be later than ${currentYear}`)
      .optional()
  ),
});

export const updateCompanySchema = companySchema.partial();

export const validateCompany = (data) => {
  return companySchema.safeParse(data);
};
