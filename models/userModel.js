const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    // 获取信息时不返回该字段
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date
})

// 密码加密
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()

  // Hash the password with cost of 12
  // 加12位盐
  this.password = await bcrypt.hash(this.password, 12)
  // 保存到数据库前把确认密码删掉
  this.passwordConfirm = undefined
  next()
})

// 判断密码是否相同
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // 使用bcrypt的方法之直接比较两个密码是否一样
  // 返回Boolean
  return await bcrypt.compare(candidatePassword, userPassword)
}

// 判断用户是否在发送token后修改了密码
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // 10进制
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    console.log(changedTimestamp, JWTTimestamp)
    return JWTTimestamp < changedTimestamp
  }
  // False means NOT changed
  return false
}

const User = mongoose.model('User', userSchema)

module.exports = User