const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name, price, ratingsAverage,summary,difficulty'
  next()
}


exports.getAllTours = catchAsync(async (req, res) => {
  // Execute query
  // 因为返回的是this所以可以一直调用实例里面的方法
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
  const tours = await features.query // 等待query有值

  // Send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  })
})



exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body)
  // 201代表创建成功 
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  // Tour.findOne({ _id: req.params.id })
  // 简写 
  const tour = await Tour.findById(req.params.id)
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404))
  }
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    data: {
      tour
    }
  })
})

exports.updateTour = catchAsync(async (req, res, next) => {
  // new: true是设置更新后返回那个新数据
  // runValidators 验证器 是否为相同数据类型
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOneAndDelete(req.params.id)
  // http状态码 204 (无内容) 服务器成功处理了请求,但没有返回任何内容。

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404))
  }
  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.getTourStats = catchAsync(async (req, res, next) => {
  // 聚合管道
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }
      }
    },
    {
      // $group 将每个领域字段进行分组, 然后通过他们计算出你想要的东西
      $group: {
        _id: '$difficulty', // 难易度分析，把难度字段的值作为id，就可以分类出不同等级的数据
        numTours: { $sum: 1 }, // 统计数据条数
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' }, // 计算平均值
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' }, // 计算最小值
        maxPrice: { $max: '$price' },
      }
    },
    {
      $sort: { // 排序
        avgPrice: 1  // 1 表示升序
      }
    },
    {
      $match: { _id: { $ne: 'easy' } } // 不包括easy难度
    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1 // 2021
  const plan = await Tour.aggregate([
    {
      // $unwind用来实现对文档的拆分,可以将文档中的值拆分为单独的文档
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          // 限制开始与结束日期
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        // $push操作符添加指定的值到数组
        tours: { $push: '$name' }
      }
    },
    {
      // 添加字段，就是在查询的结果再添加一些字段信息，字段的内容自己决定
      $addFields: { month: '$_id' }
    },
    {
      // $project 选择要显示的字段 0 不显示 1 显示
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numToursStarts: -1 }
    },
    {
      $limit: 12 // 限制输出 N 条数据
    }
  ])


  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  })

})