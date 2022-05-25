// 脚本文件
// 导入（json）文件中的数据到数据库中\删除数据库中的数据


const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('./../../models/tourModel')
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

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'))

// import data into db
const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('Data successfully loaded!')
  } catch (e) {
    console.log(e)
  }
  process.exit()
}

// Delete all data from db
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data successfully deleted!')
  } catch (e) {
    console.log(e)
  }
  // 退出控制台
  process.exit()
}

if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData()
}
