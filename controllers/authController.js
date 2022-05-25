// node自带的异步包装方法
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // 有效期
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }

  // 2) Check if user exist && password is correct
  // select('+xxx') 是加上Schema中设置了不返回的字段,比如这里要获取密码，但是因为设置了不返回条件，无法获取，所以要加上这个
  const user = await User.findOne({ email: email }).select('+password')

  // 先判断用户是否存在，再判断密码是否相同，需要注意这个顺序
  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401))
  }

  // 3) If everything ok, send token to client

  const token = signToken(user.id)
  res.status(200).json({
    status: 'success',
    token
  })
})


exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  // console.log(token)

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401))
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id)
  if (!freshUser) {
    const err = new AppError('The user belongin to this token does no longer exist.', 401)
    next(err)
    return
  }

  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401))
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser
  next()
})

// 删除操作的权限判断
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide'], role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }
    next()
  }
}