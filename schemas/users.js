var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports= new Schema ({
  username: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: true
  },
  isManage: {
    type: Boolean,
    default: false
  }
})