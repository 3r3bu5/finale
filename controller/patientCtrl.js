const Patient = require('../model/patient.model');
const Image = require('../model/image.model');
// logging
const loggerService = require('../services/logger.service');
var logger = new loggerService('patient.controller');
// error handling
const APIError = require('../error/api.error');
const ErrorStatus = require('../error/errorStatusCode');
const ErrorType = require('../error/errorType');

exports.getAll = async (req, res, next) => {
  try {
    const patient = await Patient.find({ _doctorId: req.user._id });
    logger.info(
      `PATIENT: retreived all patients for user with email address ${req.user.email}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, patient });
  } catch (err) {
    logger.error(
      `PATIENT: error retreiving all patients for user with email address ${req.user.email}`,
      err.description || err.message
    );
    res.setHeader('Content-Type', 'application/json');
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};
exports.createOne = async (req, res, next) => {
  try {
    let patient = new Patient({
      _doctorId: req.user._id,
      fname: req.body.firstname,
      lname: req.body.lastname,
      age: req.body.age,
      gender: req.body.gender,
    });
    let savedPatient = await patient.save();
    logger.info(
      `PATIENT: created new patient for user with email address ${req.user.email}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, savedPatient });
  } catch (err) {
    logger.error(
      `PATIENT: error creating new patient for user with email address ${req.user.email}`,
      err.description || err.message
    );
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId });
    if (!patient) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.NOT_FOUND,
        'Patient not found',
        true
      );
    }
    if (patient && req.user._id != patient._doctorId) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.UNAUTHORIZED,
        'Unauthorized Access',
        true
      );
    }
    logger.info(
      `PATIENT: retreived patient with id ${patient._id} for user with email address ${req.user.email}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, patient });
  } catch (err) {
    logger.error(
      `PATIENT: error trying to get patient with id ${req.params.patientId} for user with email address ${req.user.email}`,
      err.description || err.message
    );
    res.setHeader('Content-Type', 'application/json');
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId });
    if (!patient) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.NOT_FOUND,
        'Patient not found',
        true
      );
    }
    if (req.user._id != patient._doctorId) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.UNAUTHORIZED,
        'Unauthorized Access',
        true
      );
    }

    if (req.body.firstname) {
      patient.fname = req.body.firstname;
    }
    if (req.body.lastname) {
      patient.lname = req.body.lastname;
    }
    if (req.body.age) {
      patient.age = req.body.age;
    }
    if (req.body.gender) {
      patient.gender = req.body.gender;
    }
    logger.info(
      `PATIENT: updated patient with id ${patient._id} for user with email address ${req.user.email}`
    );
    const newPatient = await patient.save();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, newPatient });
  } catch (err) {
    logger.error(
      `PATIENT: error trying to update patient with id ${req.params.patientId}`,
      err.description || err.message
    );
    res.setHeader('Content-Type', 'application/json');
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId });
    if (!patient) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.NOT_FOUND,
        'Patient not found',
        true
      );
    }
    if (req.user._id != patient._doctorId) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.UNAUTHORIZED,
        'Unauthorized Access',
        true
      );
    }
    await patient.remove();
    logger.info(
      `PATIENT: deleted patient with id ${patient._id} for user with email address ${req.user.email}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, msg: 'Deleted successfully' });
  } catch (err) {
    logger.error(
      `PATIENT: error trying to remove patient with id ${req.params.patientId}`,
      err.description || err.message
    );
    res.setHeader('Content-Type', 'application/json');
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};

exports.getPatientHistory = async (req, res, next) => {
  try {
    const history = await Image.find({
      _patientId: req.params.patientId,
    }).populate('_patientId');
    if (!history) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.NOT_FOUND,
        'No history records',
        true
      );
    }
    if (
      history &&
      (history.length > 0
        ? req.user._id !== history[0]._patientId._doctorId
        : false)
    ) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.UNAUTHORIZED,
        'Unauthorized Access',
        true
      );
    }
    logger.info(
      `PATIENT: retrieved patient history with id ${req.params.patientId} for user with email address ${req.user.email}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, history });
  } catch (err) {
    logger.error(
      `PATIENT: error trying get patient history with id ${req.params.patientId} for user with email address ${req.user.email}`,
      err.description || err.message
    );
    res.setHeader('Content-Type', 'application/json');
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};
exports.deletePatientHistory = async (req, res, next) => {
  try {
    let history = await Image.findOne({
      _patientId: req.params.patientId,
      _id: req.params.historyId,
    }).populate('_patientId');

    if (!history) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.NOT_FOUND,
        'No history records',
        true
      );
    }
    if (
      history &&
      (history.length > 0
        ? req.user._id !== history._patientId._doctorId
        : false)
    ) {
      throw new APIError(
        ErrorType.API_ENDPOINT_ERROR,
        ErrorStatus.UNAUTHORIZED,
        'Unauthorized Access',
        true
      );
    }
    await history.remove();
    logger.info(
      `PATIENT: removed all patient history with id ${req.params.patientId} for user with email address ${req.user.email}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, msg: 'Delete history successfully' });
  } catch (err) {
    logger.error(
      `PATIENT: error trying to remove patient history with id ${req.params.patientId} for user with email address ${req.user.email}`,
      err.description || err.message
    );
    res.setHeader('Content-Type', 'application/json');
    return res
      .status(err.httpStatusCode || 500)
      .json({ success: false, err: err.description || err.message });
  }
};
