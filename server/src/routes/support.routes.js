import { Router } from "express";

import {
  createSupportMessage,
} from "../controllers/support.controller.js";


import { validate } from "../middleware/validate.js";

import {
  supportValidationSchema,
} from "../validations/support.validation.js";



const router = Router();



router.post(
  "/",
  validate(supportValidationSchema),
  createSupportMessage
);






export default router;