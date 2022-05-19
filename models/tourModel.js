const mongoose = require('mongoose')
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    // 值必须唯一
    unique: true,
    trim: true
  },
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
    required: [true, 'A tour must have a difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: Number,
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


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour