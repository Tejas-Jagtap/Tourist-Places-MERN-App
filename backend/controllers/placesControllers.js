const fs = require("fs");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const pid = req.params.pid;

  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    const e = new HttpError("somthing went wrong", 500);
    return next(e);
  }

  if (!place) {
    return next(new HttpError("Not Found Data", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlaceByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(uid).populate("places");
    // console.log(userWithPlaces);
  } catch (err) {
    const e = new HttpError("somthing 101went wrong", 500);
    return next(e);
  }
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError("Not Found Data", 404));
  }

  res.json({
    place: userWithPlaces.places.map((p) => p.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Input Passed", 422));
  }
  const { title, description, address } = req.body;
  const newPlace = new Place({
    title,
    description,
    address,
    image: req.file.path,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    const e = new HttpError("Creating Place Failed, Please Try Again", 500);
    return next(e);
  }

  if (!user) {
    const e = new HttpError("Could not found user for provided id", 500);
    return next(e);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save();
    user.places.push(newPlace);
    await user.save();
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating Place Failed, Please Try Again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: newPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid Input Passed", 422));
  }
  const pid = req.params.pid;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError(
      "Updating Place Failed, Please Try Again.",
      500
    );
    return next(error);
  }
  if (place.creator.toString() !== req.userData.userId) {
    const e = new HttpError("You are not the creator of this place", 403);
    return next(e);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("somethinf went wrong", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  let place;
  try {
    place = await Place.findById(pid).populate("creator");
  } catch (err) {}

  if (place.creator.id !== req.userData.userId) {
    const e = new HttpError("You are not the creator of this place", 403);
    return next(e);
  }

  const placeItem = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.deleteOne();
    place.creator.places.pull(place);
    await place.creator.save();
    await sess.endTransaction();
  } catch (err) {
    // const error = new HttpError(
    //   "Deleting Place Failed, Please Try Again.",
    //   500
    // );
    // return next(error);
  }
  fs.unlink(placeItem, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted Place..." });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
