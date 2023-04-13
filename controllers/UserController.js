import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { validationResult } from 'express-validator';

import UserModel from '../models/User.js';

export const userRegister = async (req, res) => {
  try {
    //Хешируем пароль-----------------------------------------------------------
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    //----------------------------------------------------------------------

    //Создаем юзера-------------------------------------------------------------
    const userData = new UserModel({
      email: req.body.email,
      avatarUrl: req.body.avatarUrl,
      fullName: req.body.fullName,
      passwordHash: hash,
    });

    //И сохраняем-----
    const user = await userData.save();
    //----------------------------------------------------------------------

    //Создаем токен----------------------------------------------------------
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'userToken',
      {
        expiresIn: '30d',
      },
    );

    //----------------------------------------------------------------------

    const { passwordHash, ...data } = user._doc;

    res.json({ ...data, token });
  } catch (e) {
    console.log('error:', e);

    res.status(500).json({
      message: 'Registration error :-(',
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    //Нахочим чела-----------------------------------------------------------
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Auth error :-(',
      });
    }

    //----------------------------------------------------------------------

    //Сравниваем введенный пароль с нашим---------------------------------------------
    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Wrong login or password :-(',
      });
    }
    //--------------------------------------------------------------------------------

    //Создаем токен-------------------------------------------------------------------
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'userToken',
      {
        expiresIn: '30d',
      },
    );
    //-------------------------------------------------------------------------------

    const { passwordHash, ...data } = user._doc;

    res.json({
      ...data,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Auth failed :-(',
    });
  }
};

export const userGetMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User is not defined :-(',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'access denied :-(',
    });
  }
};
