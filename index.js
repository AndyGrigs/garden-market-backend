import express from 'express'
import cors from 'cors'

import mongoose from 'mongoose'

import {registerValidation} from './validations/auth.js'
import { loginValidation } from './validations/login.js'
import { postCreateValidation } from './validations/postCreation.js'

import checkAuth from "./utils/checkAuth.js"
import { register, login, getMe } from './controllers/userController.js';
import * as postController from './controllers/postController.js'
import handleValidationErrors from './utils/handleValidationErrors.js'
import dotenv from 'dotenv';

dotenv.config();


const DATABASE_URL = process.env.DATABASE_URL;



mongoose.connect(DATABASE_URL)
        .then(()=>{
            console.log('db works')
        }).catch((err)=>{
            console.log('db error', err)
        })


const app = express();



app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(cors())
app.post('/upload', checkAuth, upload.single('image'), (req, res) =>{
    res.json({
        url: `/upload/${req.file.originalname}`
    })
})

app.post('/auth/login',loginValidation, handleValidationErrors, login);
app.post('/auth/register',registerValidation, handleValidationErrors, register)
app.get('/auth/me', checkAuth, getMe)

app.get('/tags',  postController.getLastTags)
app.get('/posts',  postController.getAll)
app.get('/posts/tags',  postController.getLastTags)
app.get('/posts/:id',  postController.getOne)
app.post('/posts',checkAuth,postCreateValidation, handleValidationErrors, postController.create)
app.delete('/posts/:id', checkAuth,  postController.deleteOne)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors , postController.updateOne)

app.listen(4444, (err) => {
    if(err){
        return console.log(err)
    }

    console.log('Server works')
})
