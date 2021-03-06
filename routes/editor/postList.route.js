var express = require('express');
var postModel = require('../../models/post.model');

var router = express.Router();

router.get('/', (req, res, next) => {
    var uId = req.user.acc_id;

    var page = req.query.page || 1;

    if (page < 1) page = 1;

    var limit = 7;
    var offset = (page - 1) * limit;

    Promise.all(
        [postModel.editorPostList(uId, limit, offset),
        postModel.countEditorPostList(uId)]
    ).then(([rows, totalRow]) => {
        
        if(rows.length>0){
        var total = totalRow[0].total;
        } else var total = 0;


        var nPages = Math.floor(total / limit);
        if (total % limit > 0) nPages++;
        var pages = [];
        for (i = 1; i <= nPages; i++) {
            var obj = { value: i, active: i === +page };
            pages.push(obj);
        }

        res.render('dashboardViews/editor/postlist', {
            layout: 'dashboard.hbs',
            pages,
            PageTitle: 'Danh sách bài viết chờ duyệt',
            PostsInfo: rows
        });

        console.log(total + '  ' + pages);

    }).catch(next);


});

module.exports = router;