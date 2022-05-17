const express = require('express')
const morgan = require('morgan')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) middleware

// 中间件 为了解析body的json为普通对象
app.use(morgan('dev'))
app.use(express.json())
// 从文件夹中提供静态文件（http://127.0.0.1:3000/img/pin.png，在浏览器地址栏中这样访问）
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  console.log('hello from the middleware')
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})



// 2) route handlers


// 3)route




app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

// 4) start server

module.exports = app