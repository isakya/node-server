const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
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
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// 集中式错误处理中间件
app.use(globalErrorHandler)

// 4) start server
module.exports = app
