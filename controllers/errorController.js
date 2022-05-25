const AppError = require('./../utils/appError')

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*\1/)[0]
  const message = `Duplicate field value: ${value}. please use another value`
  return new AppError(message, 400)
}
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401)
}

const handleJWTExpiredError = () => new AppError('Your token has expired! Please login again', 401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // console.log(err.message)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || err.msg
    })
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR', err)
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
}

module.exports = (err, req, res, next) => {
  // stack 堆栈跟踪
  // console.log(err.stack)
  // 状态码
  err.statusCode = err.statusCode || 500
  // 状态信息
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    // console.log(error, 99999)
    // _id 长度与类型不同的报错信息
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    // name 重复的报错信息
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'validationError') error = handleValidationErrorDB(error)
    // token错误
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    // token过期提示
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    sendErrorProd(error, res)
  }
}