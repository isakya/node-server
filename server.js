const mongoose = require('mongoose')
const dotenv = require('dotenv')
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
    useFindAndModify: false
  }).then(() => console.log('DB connection successfully!')
  )


// console.log(app.get('env')) // express 的环境变量
// console.log(process.env) // node内部的环境变量

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App runing on port ${port}...`)
})