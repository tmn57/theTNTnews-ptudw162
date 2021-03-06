var express = require('express');
var moment = require('moment');

var postModel = require('../../models/post.model');
var catModel = require('../../models/category.model');
var tagModel = require('../../models/tag.model');
var router = express.Router();


router.get('/:id', (req, res, next) => {
    var postId = req.params.id;
    postModel.editorSinglePostById(req.user.acc_id, postId).then(prows => {
        tagModel.tagListByPostId(postId).then(trows => {
            res.render('dashboardViews/editor/editPost', {
                isEdit: true,
                layout: 'dashboard.hbs',
                PageTitle: 'Chỉnh sửa: ' + prows[0].post_title,
                Post: prows[0],
                Tags: trows,
                PostButtonTitle: '<i class="fas fa-spell-check mr-2"></i>Lưu lại và duyệt'
            });
        });
    });
});

router.post('/:id', (req, res, next) => {
    var postId = req.params.id;
    var postType = req.body.post_type;
    var postStatus = 'publish';
    var postCategory = req.body.post_category;
    if (moment(req.body.post_time).isValid())
    {
        var postTime = moment(req.body.post_time, 'HH:mm:ss DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss');
    }
    else {
        var postTime = moment().add(1,"days").format('YYYY-MM-DD HH:mm:ss');
    }
    var postEditor = req.user.acc_id;

    var post = {
        post_id: postId,
        post_type: postType,
        post_status: postStatus,
        post_category: postCategory,
        post_time: postTime,
        post_editor: postEditor
    }

    var tagsName = req.body.post_tags;

    if (tagsName && (tagsName.length > 0)) {
        Promise.all(tagsName.map((tagname) => {
            return tagModel.addIgnore({ tag_name: tagname });
        })).then(() => {
            Promise.all(tagsName.map((tagname) => {
                return tagModel.findTagByName(tagname).then(tnames => {
                    return tnames[0].tag_id;
                })
            })).then(tagIds => {
                postModel.deleteAttachedTagsByPostId(postId).then(() => {
                    Promise.all([tagIds.map(tagId => {
                        return postModel.attachTag({ posttag_post: postId, posttag_tag: tagId });
                    }),
                    postModel.update(post)]).then(
                        res.redirect('/editor/postlist'));
                });
            })
        });
    } else {
        Promise.all([postModel.deleteAttachedTagsByPostId(postId), postModel.update(post)]).then(() => {
            res.redirect('/editor/postlist')
        });
    }
});

router.post('/reject/:id', (req, res, next) => {
    postModel.update(
        {
            post_id: req.params.id,
            post_status: 'deny',
            post_time: moment().format('YYYY-MM-DD HH:mm:ss'),
            post_editor: req.params.id,
            post_denyreason: req.body.post_denyreason
        }
    ).then(
        res.redirect('/editor/postlist')
    );
});

module.exports = router;