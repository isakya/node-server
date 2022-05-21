module.exports = (err, req, res, next) => {
  // stack 堆栈
  console.log(err.stack)
  // 状态码
  err.statusCode = err.statusCode || 500
  // 状态信息
  err.status = err.status || 'error'
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
}