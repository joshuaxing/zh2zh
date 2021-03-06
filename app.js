var express = require('express');
var path = require('path');
var config = require('config-lite')(__dirname);
var bodyParser = require('body-parser');
var Cookies = require('cookies');
var User = require('./models/User');
var ueditor = require("ueditor");
var app = require('./base.js');
app.use(express.static(path.join(__dirname, 'uditors')));

//post提交过来的数据
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//缓存
app.use(function(req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    if(req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            User.findById(req.userInfo._id).then(function(userInfo){
                if (userInfo) {
                    req.userInfo.isAdmin = Boolean(userInfo.isAdmin); //进入后台验证
                    req.userInfo.isManage = Boolean(userInfo.isManage);//后台权限管理验证
                }
                next()
            })
        } catch (error) {
            next()
        }
    } else {
        next()
    }
})
app.use("/ueditor/ue", ueditor(path.join(__dirname), function(req, res, next) {
    // ueditor 客户发起上传图片请求
  
    if(req.query.action === 'uploadimage'){
  
      // 这里你可以获得上传图片的信息
      var foo = req.ueditor;
      //console.log(foo.filename); // exp.png
      //console.log(foo.encoding); // 7bit
      //console.log(foo.mimetype); // image/png
  
      // 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
      var img_url = '/public/images/ueditor';
      res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage'){
      var dir_url = '/public/images/ueditor'; // 要展示给客户端的文件夹路径
      res.ue_list(dir_url) // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
      res.setHeader('Content-Type', 'application/json');
      // 这里填写 ueditor.config.json 这个文件的路径
      res.redirect('/ueditor/nodejs/config.json');
}}));
/* 
    根据不同的功能划分模块
 */
app.use('/admin', require('./routers/admin.js'));
app.use('/api', require('./api/api.js'));
app.use('/', require('./routers/router.js'));

app.listen(config.app.port, function() {
    console.log(`运行端口号为:${config.app.port}`)
})
