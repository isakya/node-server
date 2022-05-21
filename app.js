const express = require('express')
const morgan = require('morgan')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// 中间件 为了解析body的json为普通对象
app.use(express.json())
// 从文件夹中提供静态文件（http://127.0.0.1:3000/img/pin.png，在浏览器地址栏中这样访问）
app.use(express.static(`${__dirname}/public`))


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 2) route handlers

// 3)route
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

// 如果以上所有路由都匹配不到就执行这个中间件
// all匹配所有类型请求
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   // req.originalUrl 如 /api/tours
  //   message: `Can't find ${req.originalUrl} on this server!`
  // })
  const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  err.status = 'fail'
  err.statusCode = 404
  // 把错误参数传递给下一个中间件
  next(err)
})

// 集中式错误处理中间件
app.use((err, req, res, next) => {
  // 状态码
  err.statusCode = err.statusCode || 500
  // 状态信息
  err.status = err.status || 'error'
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
})

// 4) start server
module.exports = app
