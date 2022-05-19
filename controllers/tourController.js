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
    const features = new APIFeatures(Tour, req.query).filter().sort().limitFields().paginate()
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