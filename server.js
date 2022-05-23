const mongoose = require('mongoose')
const dotenv = require('dotenv')

// 捕获未捕获的异常
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

const app = require('./app')
dotenv.config({ path: './config.env' }) // 用来这个dotenv注册env配置文件之后就可以全局用process.xx来访问env里定义的环境变量


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose
  // 本地数据库
  // .connect(process.env.DATABASE_LOCAL, {
  // 远程数据库
  .connect(DB, {
    // 处理一些弃用警告
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // 去除控制台的某个警告
    useUnifiedTopology: true
  }).then(() => console.log('DB connection successfully!')
  )


// console.log(app.get('env')) // express 的环境变量
// console.log(process.env) // node内部的环境变量

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App runing on port ${port}...`)
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION! Shutting down...')
  console.log(err.name, err.message)
  // 关闭服务器
  server.close(() => {
    // 终止当前仍在运行的所有请求
    process.exit(1)
  })
})




