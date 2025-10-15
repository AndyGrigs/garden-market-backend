// validations/tree.js
import { body } from 'express-validator';

export const treeValidation = [
  body('title').isObject().withMessage('Title must be an object'),
  body('title.ru').notEmpty().withMessage('Russian title is required'),
  body('title.ro').notEmpty().withMessage('Romanian title is required'),
  
  body('description').isObject().withMessage('Description must be an object'),
  body('description.ru').notEmpty().withMessage('Russian description is required'),
  body('description.ro').notEmpty().withMessage('Romanian description is required'),
  
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('imageUrl').optional().isString().withMessage('Image URL must be a string')
];