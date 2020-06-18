const Easypost = require('@easypost/api')
const postApi = new Easypost(process.env.EASYPOST_KEY)

module.exports = postApi