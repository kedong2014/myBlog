/*模块的引入*/
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');

var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); 
var settings = require('./settings'); 

/*
文件夹形式的本地模块
作用是为指定路径组织返回内容，相当于控制器。
*/
var routes = require('./routes/index');
var users = require('./routes/users');

// 创建服务器应用实例 createServer()
var app = express();

// app.set() 用于参数设置配置
// view engine setup
// 页面模版在views目录下，且设置模版引擎为ejs
// render()是调用模版引擎
app.set('views', path.join(__dirname, 'views'));
//app.engine('html', ejs.__express);
//设置视图引擎
//app.set('view engine', 'html');  
app.set('view engine', 'ejs');  
// 使用片段视图
app.use(partials());
// app.use() 可以使用大量的中间件完成特殊的http功能
app.use(flash());
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());  //解析cookie的组间
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        db: settings.db,
    })
}));

app.use(function(req, res, next){
  console.log("app.usr local");
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  var error = req.flash('error');
  res.locals.error = error.length ? error : null;
 
  var success = req.flash('success');
  res.locals.success = success.length ? success : null;
  next();
});


// 路由控制器：根据不同的路径定义到不同的控制器，参数为路径和处理的函数
app.use('/', routes);
app.use('/users', users);

// 错误处理
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


//var debug = require('debug')('my-application'); // debug模块
//app.set('port', process.env.PORT || 3000); // 设定监听端口
module.exports = app;  //这是 4.x 默认的配置，分离了 app 模块,将它注释即可，上线时可以重新改回来
//var server = app.listen(app.get('port'), function() {
//debug('Express server listening on port ' + server.address().port);
//});
