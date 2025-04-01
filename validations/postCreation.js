import {body} from 'express-validator'

export const postCreateValidation = [
    body('title', 'enter your title').isLength({min: 3}).isString(),
    body('text', 'enter your text').isLength({min: 10}).isString(),
    body('tags', 'Wrong tags format').optional().isString(),
    body('imageUrl', 'wrong photo URL ').optional().isString()
]