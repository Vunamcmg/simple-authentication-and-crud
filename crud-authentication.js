/* Cac package npm su dung 
    express
    body-parser
    mongoose
    express-session: Dung de lua session khi nguoi dung dang nhap 
*/
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var app=express();

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

// Import model o day vi du la User dung de luu thong tin nguoi dung , Post luu thong tin bai viet
var User = require('./models/users');

var Post = require('./models/posts');

//Dang nhap dang ki dang xuat đơn giản

//Khai bao ham dung de kiem tra xem nguoi dung da dang nhap hay chua neu roi thi thuc hien ham callback thu hai ( next()) chua thi chuyen huong sang trang login

var authenticated = function(request,response,next){
    if (request.session && request.session.user) return next();
    return response.redirect('/login');     
}

app.get('/login',function(request,response){
    response.render('login',{title:'Login'});
});

app.post('/login',function(request,response){
    if (request.body.username && request.body.password){
        User.findOne({username:request.body.username},function(error,user){
            if(!user){
                response.send('Tên người dùng không đúng');
            }
            else{
                if (user.compare(request.body.password)){
                    request.session.user = user;
                    request.session.save();
                    response.redirect('/');
                }
                else{
                    response.send('Mật khẩu không đúng');
                }
            }
        });
    }
    else{
        response.send('Thiếu tên đăng nhập hoặc mật khẩu');
    }
});

app.get('/register',function(request,response,next){
    if (!request.session || !request.session.user) return next();
    return response.send('Bạn đã đăng nhập');     
},function(request,response){
    if(request.session){
        response.send('register');
    }
    else{
        response.redirect('/');
    }
});

app.post('/register',function(request,response){
    function testEmail(email){
        var re= /^.+@.+$/;
        return re.test(email);
    };
    
    //Hàm create đã tự xem nó là duy nhất hay chưa rồi
    if (request.body.username && request.body.password){
        if (testEmail(request.body.email)){ 
            User.create({
                username: request.body.username,
                password: request.body.password,
                firstname: request.body.firstname,
                lastname:request.body.lastname,
                email:request.body.email
            },function(error,user){
            if (error)
            {
                response.send('Không tạo được tài khoản');
            }
            else
            {
                response.send(user);
            }
        });
        }
        else{
                response.send('Email không đúng');
        }
    } 
    else{
        response.send('username hoặc mật khẩu không đúng'); 
    }
});

app.post('/logout',authenticated,function(request,response){
    request.session.destroy(function(error){
        if (error){
            response.send('Không thể đăng xuất vào lúc này');
        }
        response.send('Đăng xuất thành công');
    });
});


// CRUD đơn giản cho post


// Create
function(request,response){
    Post.create({
        body: request.body.body,
        public:request.body.public,
        user: request.session.user._id,
        category:request.body.category,
    }, function(error,post){
        if(!post){
            response.send('Không tạo được bài viết');
        }
        else{
            response.send(post);
        }
    });
};

// Read 

app.get('/post/:id',function(request,response){
    Post.findOne({_id:request.params.id}).populate('user').exec(function(error,post){
        response.send(post);
    });
});

// Update 

app.get('/editpost/:id',function(request,response){
    Post.findOne({_id:request.params.id},function(error,post){
        // Render ra views 
        response.render('editpost',{post:post});
    })
});
app.post('/editpost/:id',function(request,response){
    Post.findOne({_id:request.params.id},function(error,post){
        if(error){
            response.send('Không thể cập nhật thông tin lúc này');
        }
        
        if(post){
            Post.update({_id:post._id},{ $set: {
               body: request.body.body,
               category: request.body.category,
            }},function(error,post){
                if(error){
                    response.send('Không thể cập nhật thông tin lúc này');
                }
                else{
                    response.send(post);
                }
                
            });
        }
    })
});
// Delete
app.post('/remove/:id',authenticated, function(request,response){
    Post.deleteOne({_id:request.params.id},function(error){
                    response.send('Đã xóa bài viết');
    });
};