const mongoose = require('mongoose')
const slugify = require('slugify')
// 用validator先得npm i validator
const validator = require('validator')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    // 值必须唯一
    unique: true,
    trim: true,
    // 数据验证：默认开启，也可在Controller，的runValidators: false 更新创建文档函数中传入它来关闭
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour name must have more or equal then 40 characters'],
    validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    // 验证难易度必须为这三个枚举值
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    // 验证评分为1-5直接 包括1和5
    min: [1, 'Rating must be above 1'],
    max: [5, 'Rating must be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    // 自定义验证规则
    validate: {
      validator: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.price // 100 < 200
      },
      // 这个VALUE 是个变量 等于val
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },
  summary: {
    type: String,
    // 删除字符开头和结尾的空格符
    trim: true,
    required: [true, 'A tour must have a description']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  // 定义一个数组，数组里面是字符串
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    // 请求时不返回创建时间
    select: false
  },
  // 为日期格式，mongo会将传入的值解析为日期，如果格式不对就会报错
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
}, {
  // 虚拟数据转换格式
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}

)

// 虚拟数据模型，不会出现在数据库中，但输出数据库中的数据时候才会出现,所以数据库查询方法对它没用
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7 // 因为要用到this所以不用箭头函数
})

// 创建中间件
// mongoose的 创建 DOCUMENT 中间件, runs before .save()保存 and .create()创建, 可以在这两个动作之前先拿到数据对其进行处理
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

tourSchema.pre('save', function (next) {
  console.log('Will save document...')
  next()
})

// post不用this 因为他已经在数据库中有文档了
tourSchema.post('save', function (doc, next) {
  // console.log(doc)
  // 最后一个中间件可以不写next，但最好带上
  next()
})

// 查询中间件
// 适用于 find() 但不适用于其他findxxx 如 findById
// tourSchema.pre('find', function (next) {
// 用正则就可以匹配所有的find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  next()
})

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs)
  next()
})

// 聚合管道中间件
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  console.log(this.pipeline())
  next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour