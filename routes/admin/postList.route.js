var express = require('express');
var postModel = require('../../models/post.model');

var router = express.Router();

router.get('/:filtertype', (req, res, next) => {

    var page = req.query.page || 1;
    if (page < 1) page = 1;

    var filterType = req.params.filtertype;

    var limit = 7;
    var offset = (page - 1) * limit;

    var filterString = '';

    switch (filterType) {
        case 'all':
            filterString = `'' OR 1`;
            break;
        case 'published':
            filterString = `'publish' and now() >= post_time`;
            break;
        case 'approved':
            filterString = `'publish' and now() < post_time`;
            break;
        case 'denied':
            filterString = `'deny'`;
            break;
        case 'wait':
            filterString = `'wait'`;
            break;
        default:
            filterString = null;
            break;
    }

    if (filterString) {
        Promise.all([
            postModel.adminPostList(filterString, limit, offset),
            postModel.countAdminPostList(filterString)
        ]).then(([rows, totalRow]) => {

            var total = totalRow[0].total;

            var nPages = Math.floor(total / limit);
            if (total % limit > 0) nPages++;
            var pages = [];
            for (i = 1; i <= nPages; i++) {
                var obj = { value: i, active: i === +page };
                pages.push(obj);
            }

            res.render('dashboardViews/admin/postList', {
                layout: 'dashboard.hbs',
                pages,
                PageTitle: 'Danh sách bài',
                PostsInfo: rows
            });
        }).catch(next);
    } else {
        res.render('_noLayout/404', { layout: false });
    }
});

module.exports = router;