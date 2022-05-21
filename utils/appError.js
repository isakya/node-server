class AppError extends Error {
  constructor(message, statusCode) {
    // 等同于 new Error(message)
    super(message)

    this.statusCode = statusCode
    // String.startsWith 查看字符串是否以指定的子字符串开头。
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    // 判断错误是否来自本server，有可能是第三方包的错误
    this.isOperational = true

    // 由于Error.captureStackTrace()可以返回调用堆栈信息，因此在自定义Error类的内部经常会使用该函数，用以在error对象上添加合理的stack属性。上文中的MyError类即是一个最简单的例子。

    // 为了不向使用者暴露自定义Error类的内部细节，在自定义Error类内部使用captureStackTrace时，往往会传入constructorOpt参数，其值即为自定义 Error类的构造函数。具体做法有3种：

    // Error.captureStackTrace(this, MyError); 将构造函数的变量名作为constructorOpt参数传入。这一做法比较简单、直接，但不利之处也比较明显：代码所要传达的是“忽略当前构造函数及其内部的堆栈调用信息”，而以具体的构造函数作为参数传入使得这一语句缺乏通用性，不利于程序的进一步抽象。

    // Error.captureStackTrace(this, this.constructor); 通过this.constructor传入constructorOpt参数。与上一种方法相比，这一方式更具通用性。在自定义Error类中使用captureStackTrace时，推荐采用该方法。

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError