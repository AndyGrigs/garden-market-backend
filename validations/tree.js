// validations/tree.js (create this file)
import { body } from 'express-validator';

export const treeValidation = [
  body('title.ru').notEmpty().withMessage('Russian title is required'),
  body('title.en').notEmpty().withMessage('English title is required'), 
  body('title.ro').notEmpty().withMessage('Romanian title is required'),
  body('description.ru').notEmpty().withMessage('Russian description is required'),
  body('description.en').notEmpty().withMessage('English description is required'),
  body('description.ro').notEmpty().withMessage('Romanian description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').isMongoId().withMessage('Valid category ID is required')
];