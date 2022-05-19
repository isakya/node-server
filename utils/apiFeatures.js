class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }
  // 过滤参数
  filter() {
    const queryObj = { ...this.queryString }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach(el => delete queryObj[el])

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    console.log(JSON.parse(queryStr))
    this.query = this.query.find(JSON.parse(queryStr))
    // 返回整个对象
    return this
  }
  sort() {
    if (this.queryString.sort) {
      // 这样写mongoose会自动帮我们排序默认升序，sort=-price 带负号为降序
      const sortBy = req.query.sort.split(',').join(' ')
      // console.log(sortBy)
      this.query = this.query.sort(sortBy)
      // sortBy: sort('price ratingsAverage')
    } else {
      // 默认按最新时间排序
      this.query = this.query.sort('-createdAt')
    }
    return this
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      // query = query.select('name duration and price')
      this.query = this.query.select(fields)
    } else {
      // 返回字段不包含__v
      this.query = this.query.select('-__v')
    }
    return this
  }
  paginate() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

module.exports = APIFeatures