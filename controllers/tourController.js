const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name, price, ratingsAverage,summary,difficulty'
  next()
}


exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }

}

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()
    const newTour = await Tour.create(req.body)
    Tour.create(newTour)
    // 201代表创建成功 
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
}

exports.getTour = async (req, res) => {
  try {
    // Tour.findOne({ _id: req.params.id })
    // 简写 
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      // results: tours.length,
      data: {
        tour
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }

}

exports.updateTour = async (req, res) => {
  try {
    // new: true是设置更新后返回那个新数据
    // runValidators 验证器 是否为相同数据类型
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findOneAndDelete(req.params.id)
    // http状态码 204 (无内容) 服务器成功处理了请求,但没有返回任何内容。
    res.status(204).json({
      status: 'success',
      data: null
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    })
  }
}