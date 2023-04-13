import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';

import handleValidationErrors from './utils/handleValidationErrors.js';
import checkAuth from './utils/checkAuth.js';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations/validations.js';

import { UserController, PostController } from './controllers/index.js';

//Подключение к базе данных (Mongo DB)----------------------------------
mongoose
  .connect(
    'mongodb+srv://Auriel404DH:Medvedina1@clusterkursach.42pnmty.mongodb.net/blog?retryWrites=true&w=majority',
  )
  .then(() => console.log('DB ok'))
  .catch((e) => console.log('DB err', e));
//----------------------------------------------------------------------

//Создание хранилища для файлов multer----------------------------------
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
//----------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

//Методы Юзера----------------------------------------------------------------------
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.userRegister);

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.userLogin);

app.get('/auth/me', checkAuth, UserController.userGetMe);
//--------------------------------------------------------------------------------

app.post(
  '/upload',
  checkAuth,
  upload.single('image', (req, res) => {
    res.json({
      url: `./uploads/${req.file.originalname}`,
    });
  }),
);

//Методы Постов---------------------------------------------------------------------
app.post(
  '/post/create',
  // checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.createPost,
);

app.get('/post/getAll', PostController.getAllPosts);

app.get('/post/:id', PostController.getOnePost);

app.delete('/post/:id', PostController.removePost);

app.patch('/post/:id', postCreateValidation, handleValidationErrors, PostController.updatePost);
//----------------------------------------------------------------------------------

//Запуск----------------------------------
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});
//------------------------------------------
