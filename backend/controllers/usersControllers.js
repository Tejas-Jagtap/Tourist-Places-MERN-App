const { uuid } = require("uuidv4");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("fething Failed", 500));
  }
  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Input Passed", 422));
  }
  const { name, email, password } = req.body;

  let existeduser;
  try {
    existeduser = await User.findOne({ email });
  } catch (err) {
    const e = new HttpError("signing up failed", 500);
    return next(e);
  }
  if (existeduser) {
    return next(new HttpError("email already exists", 422));
  }
  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("could not create error, please try again", 500));
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Creating User Failed, Please Try Again.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supertejasjagtap",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Creating User Failed, Please Try Again.", 500);
    return next(error);
  }

  res
    .status(200)
    .json({ useId: createdUser.id, email: createdUser.email, token: token });
};

const logIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Input Passed", 422));
  }
  const { email, password } = req.body;

  let existeduser;
  try {
    existeduser = await User.findOne({ email });
  } catch (err) {
    const e = new HttpError("loginin up failed", 500);
    return next(e);
  }

  if (!existeduser) {
    return next(new HttpError("Login Failed", 401));
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, existeduser.password);
  } catch (error) {
    const e = new HttpError("login failed", 500);
    return next(e);
  }

  if (!isValidPassword) {
    return next(new HttpError("Login Failed", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existeduser.id, email: existeduser.email },
      "supertejasjagtap",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("loging Failed, Please Try Again.", 500);
    return next(error);
  }

  res.status(200).json({
    useId: existeduser.id,
    email: existeduser.email,
    token: token,
  });
};

exports.getAllUsers = getAllUsers;
exports.signUp = signUp;
exports.logIn = logIn;
