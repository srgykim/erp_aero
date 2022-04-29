`use strict`;

const express = require('express');
const fs = require('fs');

const router = express.Router();

const { User, Whitelist, Blacklist, File } = require(`../db`).models;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const multer = require('multer');
const upload = multer({ dest: "uploads/"});

/*
*  Шаблонная функция для обработки исключений.
*
*  @param cb - функция для выполнения.
* */
function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch(err) {
            next(err);
        }
    }
}

/*
*  Пагинация списка.
*
*  @array - Список для пагинации.
*  @pageSize - Размер страницы.
*  @pageNumber - Номер страницы.
* */
function paginate(array, pageSize, pageNumber) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

/*
* Возвращает id пользователя.
*
* */
router.get(`/info`, asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const whiteUser = await Whitelist.findOne({ where: { token: token } });
    const blackUser = await Blacklist.findOne({ where: { token: token } });
    if (whiteUser && !blackUser) {
        res.json(whiteUser);
    } else {
        res.json({ message: `Token has been blacklisted.` });
    }
}));

/*
* Выйти из системы.
*
* */
router.get(`/logout`, asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    const blacklistEntry = await Blacklist.create({
        email: req.body.email,
        token: token
    });

    res.status(201).json({
        message: 'Logged out successfully'
    });
}));

/*
*  Регистрация нового пользователя.
*
* */
router.post(`/signup`, asyncHandler(async (req, res, next) => {
    if (req.body.email && req.body.password) {
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        const token = jwt.sign(
            { email: req.body.email },
            'somesupersecretkey',
            {
                expiresIn: '10m'
            }
        );

        const refreshToken = randtoken.uid(256);

        const user = await User.create({
            email: req.body.email,
            password: hashedPassword,
            refreshToken: refreshToken
        });

        const whitelistEntry = await Whitelist.create({
            email: req.body.email,
            token: token
        });

        res.status(201).json({
            message: `User created`,
            email: req.body.email,
            token: token,
            refreshToken: refreshToken
        });
    } else {
        res.status(400).json({ message: `Incorrect email or password` })
    }
}));

/*
* Запрос bearer токена по id и паролю
*
* */
router.post(`/signin`, asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      throw new Error('User does not exist!');
    }

    const isEqual = await bcrypt.compare(req.body.password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      {
        expiresIn: '1h'
      }
    );

    const whitelistEntry = await Whitelist.create({
        email: req.body.email,
        token: token
    });

    res.status(200).json({
        email: user.email,
        token: token,
        tokenExpiration: '10m'
    });
}));

/*
* Обновление bearer токена по refresh токену
*
* */
router.post(`/signin/new_token`, asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      throw new Error('User does not exist!');
    }

    const isEqual = user.refreshToken === req.body.refreshToken;
    if (!isEqual) {
      throw new Error('Refresh token is not valid!');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      {
        expiresIn: '1h'
      }
    );

    const whitelistEntry = await Whitelist.create({
        email: req.body.email,
        token: token
    });

    res.status(200).json({
        email: user.email,
        token: token,
        tokenExpiration: '10m'
    });
}));

/*
* Добавление нового файла в систему и запись
*
* */
router.post(`/file/upload`, upload.single('file'), asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }

    if(req.file) {
        const file = await File.create({
            fileName: req.file.filename,
            originalName: decodeURI(req.file.originalname),
            extension: req.file.originalname.split(".")[1],
            mimeType: req.file.mimetype,
            size: req.file.size
        });
        res.status(201).json({
            message: 'File uploaded successfully',
            file: file
        });
    };
}));

/*
* Выводит список файлов и их параметров из базы с использованием пагинации с размером страницы, указанного в передаваемом параметре list_size, 
* по умолчанию 10 записей на страницу, если параметр пустой. Номер страницы указан в параметре page, по умолчанию 1, если не задан
*
* */
router.get(`/file/list`, asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }

    const files = await File.findAll();

    let listSize = 10;
    let page = 1;
    if (req.query.list_size) {
        listSize = req.query.list_size;
    }
    if (req.query.page) {
        page = req.query.page;
    }

    if (files) {
        res.status(200).json({
            files: paginate(files, listSize, page)
        });
    }
}));

/*
* Удаляет документ из базы и локального хранилища.
*
* */
router.delete(`/file/delete/:id`, asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }

    await File.destroy({where: {filename: req.params.id}});
    fs.unlinkSync(`uploads/${req.params.id}`);

    res.status(200).json({
        message: "File deleted successfully"
    });
}));

/*
* Вывод информации о выбранном файле.
*
* */
router.get(`/file/:id`, asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }

    const file = await File.findOne({where: {filename: req.params.id}});

    res.status(200).json({
        file: file
    });
}));

/*
* Скачивание конкретного файла.
*
* */
router.get(`/file/download/:id`, asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }
    const file = `uploads/${req.params.id}`;
    const fileName = await File.findOne({where: {filename: req.params.id}});
    res.download(file, fileName.dataValues.originalName);
}));

/*
* Обновление текущего документа на новый в базе и локальном хранилище.
*
* */
router.put(`/file/update/:id`, upload.single('file'), asyncHandler(async (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }
    
    await File.destroy({where: {filename: req.params.id}});
    fs.unlinkSync(`uploads/${req.params.id}`);
    fs.renameSync(`uploads/${req.file.filename}`, `uploads/${req.params.id}`);

    if(req.file) {
        const file = await File.create({
            fileName: req.params.id,
            originalName: req.file.originalname,
            extension: req.file.originalname.split(".")[1],
            mimeType: req.file.mimetype,
            size: req.file.size
        });
        res.status(201).json({
            message: 'File updated successfully',
            file: file
        });
    };
}));

module.exports = router;
