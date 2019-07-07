var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noticeSchema = new Schema({
    NOTICE_TITLE: String,
    NOTICE_IMG: String,
    NOTICE_WRITER: String,
    NOTICE_CONTENTS: String
});

module.exports = mongoose.model('notice', noticeSchema);
