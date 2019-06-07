var db = require('../utils/db');

module.exports = {
  all: () => {
    return db.load(`select * from post`);
  },

  //BEGIN For Homepage:
  //Featured Posts:  FOUR posts which have most viewed last week (exact 7 days from 'now')
  featuredPosts: () =>{
    return db.load(`select post_id, post_type, post_category, post_title, post_time, post_thumbnail, category_name, category_class from (select * from post where post_time between date_sub(now(), interval 7 day) and now()) p join category on p.post_category=category_id where post_status ='publish' order by post_viewcount desc limit 4`);
  },

  //latestPosts: TEN posts which have latest publish time
  latestPosts: () => {
    return db.load(`select post_id, post_type, post_category, post_title, post_time, post_thumbnail, category_name, category_class from post join category on post_category = category_id where post_status = 'publish' order by post_time desc limit 10`);
  },

  //mostViewPost: TEN post which have most 'viewcount' all time
  mostViewPost: () => {
    return db.load(`select post_id, post_type, post_category, post_title, post_time, post_thumbnail, category_name, category_class from post join category on post_category = category_id where post_status = 'publish' order by post_viewcount desc limit 10`);
  },

  //postOfTopCategory: TEN post which latest in each top TEN categories 
  postOfTopCategory: () =>{
    return db.load(`select post_id, post_type, post_category, post_title, post_time, post_thumbnail, category_name, category_class from (select * from post inner join (select max(post_id) as maxpid from (select post_id,post_category,max(post_time) from post group by post_category, post_id)mpd group by post_category)mpi on post_id = maxpid)p join (select category_id, category_name, category_class, sum(post_viewcount)as category_viewcount from category join post on category_id = post_category group by post_category order by category_viewcount desc limit 10)c on post_category = category_id`);
  },

  //END For Homepage.

  allInfoPublishPostByCat: catId => {
    return db.load(`select post_id, post_type, post_category, post_title, post_time, post_thumbnail, post_summary, category_name from post join category on post_category = category_id where post_status = 'publish'`);
  },

  allByCat: catId => {
    return db.load(`select * from post where post_category = ${catId}`);
  },

  pageByCat: (catId, limit, offset) => {
    return db.load(`select * from post where post_category = ${catId} limit ${limit} offset ${offset}`);
  },

  countByCat: catId => {
    return db.load(`select count(*) as total from post where post_category = ${catId}`);
  },

  single: id => {
    return db.load(`select * from post where post_category = ${id}`);
  },

  add: entity => {
    return db.add('post', entity);
  },

  update: entity => {
    return db.update('post', 'ProID', entity);
  },

  delete: id => {
    return db.delete('post', 'ProID', id);
  },
};