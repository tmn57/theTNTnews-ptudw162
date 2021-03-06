var express = require('express');

var router = express.Router();

router.get('/',(req,res)=>{
    res.redirect('/editor/postlist');
});

router.use('/postlist', require('./postList.route'));
router.use('/editpost', require('./editPost.route'));
router.use('/lastchangedpostlist',require('./lastChangedPostList.route'))

module.exports = router;