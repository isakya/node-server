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


exports.getAllTours = (req, res) => {
  console.log(req.requestTime)
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours
    // }
  })
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
      message: 'Invalid data sent!'
    })
  }
}

exports.getTour = (req, res) => {
  // const tour = tours.find(el => el.id === req.params.id * 1)
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    data: {
      // tour
    }
  })
}

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  })
}

exports.deleteTour = (req, res) => {
  // http状态码 204 (无内容) 服务器成功处理了请求,但没有返回任何内容。
  res.status(204).json({
    status: 'success',
    data: null
  })
}