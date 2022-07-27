import Joi from "@hapi/joi";
// Joi is used for the easy validation of the input parameters.
// Email: should be a string, email, lowercase, not omitable
// Password: should be a string, min 2 char, not omitable
const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
});
// had there been schemas other than authSchema, we could pass them below as well
// when exporting multiple variables, one should not use "default" keyword
export { authSchema };
