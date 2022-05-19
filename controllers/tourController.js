const Tour = require('./../models/tourModel')


// 把相同代码抽离成中间件，这里将检测id是否存在做成了中间件，然后导出给响应的路由使用
// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`)
//   // if (req.params.id * 1 > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'invalid ID'
//   //   })
//   // }
//   next()
// }

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name, price, ratingsAverage,summary,difficulty'
  next()
}


exports.getAllTours = async (req, res) => {
  try {
    // Build the query
    // 1) Filtering
    const queryObj = { ...req.query }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach(el => delete queryObj[el])

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    console.log(JSON.parse(queryStr))
    // {difficulty: 'easy', duration: {$gte: 5}}

    // ①
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy'
    // })

    // ②
    // const tours = await Tour.find().where('duration').equals(5).wheree('difficulty').equals('easy')

    // ③
    let query = Tour.find(JSON.parse(queryStr))

    // 3) Sorting
    if (req.query.sort) {
      // 这样写mongoose会自动帮我们排序默认升序，sort=-price 带负号为降序
      const sortBy = req.query.sort.split(',').join(' ')
      // console.log(sortBy)
      query = query.sort(sortBy)
      // sortBy: sort('price ratingsAverage')
    } else {
      // 默认按最新时间排序
      query = query.sort('-createdAt')
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      // query = query.select('name duration and price')
      query = query.select(fields)
    } else {
      // 返回字段不包含__v
      query = query.select('-__v')
    }

    // 5) Pagination
    // skip：跳过
    // page=2&limit=10, 1-10 page 1, 11-29, page 2, 21-30, page 3
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 100
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      // 返回该表所有数据的数量
      const numTours = await Tour.countDocuments()
      // 如果在这抛出错误，那在try catch代码中 会立马跳到catch阶段
      if (skip >= numTours) throw new Error('This page does not exist!')
    }

    // Execute query
    const tours = await query

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