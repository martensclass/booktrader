var mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    express=require('express'),
    passport=require('passport'),
    User=require('./models/user'),
    Trade=require('./models/trade'),
    LocalStrategy=require('passport-local'),
    app=express();
    
//mongoose.connect("mongodb://localhost/books");
var url=process.env.DBURL || "mongodb://localhost/books";
mongoose.connect(url);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(require('express-session')({
    secret: "The moon is on the hill",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

//auth routes
app.get('/register',function(req,res){
    res.render('register');
});

app.post('/register',function(req,res){
   var u = new User({username: req.body.username});
   var p = req.body.password;
   User.register(u,p,function(err,user){
       if(err){
          console.log(err);
         return res.render('register');  
       } 
       passport.authenticate("local")(req,res,function(){
        res.redirect('/');         
       });
   });
});

app.get('/login',function(req,res){
    res.render('login');
});

app.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login'
}),function(req,res){
    //do nothing
});

app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

//regular routes
app.get('/', function(req, res){
    res.render('index.ejs');
});


app.get('/allbooks', function(req, res){
    var books=[];
    var cuser=req.user;
    User.find({},function(err,users){
        if(err)console.log(err);
        else{
            for(var i=0; i<users.length; i++){
                for(var x=0; x<users[i].books.length; x++){
                  books.push({"user": users[i].id, "book": users[i].books[x],"status": "nt"});  
                }
            }
            Trade.find({}, function(err, trades) {
                if(err)console.log(err);
                //go thru trades looking for our user's trades
                for(var x=0; x<trades.length; x++){
                    if(trades[x].fromUser==cuser.id){
                        //find book in book collection, slap a tr status on it
                        //trade book must = book and book user must = trade toUser
                        for(var y=0; y<books.length; y++){
                            if(trades[x].book == books[y].book && books[y].user == trades[x].toUser && trades[x].status=='pending')
                             books[y].status="tr";
                        }
                    }
                else{
                        for(var y=0; y<books.length; y++){
                            if(trades[x].book == books[y].book && books[y].user == trades[x].toUser && trades[x].status=='pending')
                             books[y].status="xt";
                        }
                    
                }
                    
                }
                for(var x=0; x<trades.length; x++){
                    for(var y=0; y<books.length; y++){
                            if(trades[x].book == books[y].book && books[y].user == trades[x].toUser && trades[x].status=='approved')
                             books[y].status="ap";
                        }
                }
            res.render('allbooks.ejs', {books:books});
            });
        }
    });
});

app.get('/search', function (req,res){
    res.render('search.ejs');
});

//for search page to show a user their trades to and from
app.get('/api/gettrades/:user', function(req,res){
    var user=req.params.user;
    Trade.find( { $or:[ {'fromUser':user}, {'toUser':user} ]}, function(err,trades) {
   if(err) console.log(err);
   else{
        res.json(trades);    
   }
});
});

//for just user requested trades on allboks page
app.get('/api/getreqtrades/:user', function(req,res){
    var user=req.params.user;
    Trade.find( {'fromUser':user}, function(err,trades) {
   if(err) console.log(err);
   else{
        res.json(trades);    
   }
});
});

//for all books page to store all trades in ngapp2
app.get('/api/alltrades', function(req,res){
    Trade.find( {}, function(err,trades) {
        if(err) console.log(err);
        else{
            res.json(trades);    
        }
    });
});

app.post('/api/trades/:from/:to/:book',function(req,res){
    Trade.create({
      fromUser: req.params.from,
      toUser: req.params.to,
      book: 'https://covers.openlibrary.org/b/olid/' + req.params.book,
      status: 'pending'
    }, 
    function(err,trade){
        if(err) console.log(err);
        else
        res.sendStatus(200);    
    });
});
    
app.delete('/api/trades/:from/:to/:book',function(req,res){
    var user=req.params.from;
    var touser=req.params.to;
    var thebook='https://covers.openlibrary.org/b/olid/' + req.params.book;
     Trade.remove( { $and:[ {'fromUser': user}, {'toUser':touser}, {'book': thebook} ]}, function(err,item) {
      if(err) console.log(err);
      else
      res.sendStatus(200);
     });
});

app.delete('/api/trades/:id', function(req,res){
    var id=req.params.id;
     Trade.remove({_id:id},function(err,item){
         if(err) console.log(err);
      else
      res.sendStatus(200);
     })
});

app.post('/api/setTrade/:id/:status', function(req,res){
    Trade.findOneAndUpdate({_id: req.params.id}, {$set:{status:req.params.status}},function(err, doc){
    if(err){
        console.log(err);
    }
    res.sendStatus(200);
});
})

app.post('/api/addbook/:book/:user', function(req,res){
     User.findById(req.params.user,function(err,user){
     if(err)console.log(err);
     else
     {
         var book = 'https://covers.openlibrary.org/b/olid/' + req.params.book;
         user.books.push(book);
         user.save(function(err,user){
            if(err){
               console.log(err);
            }
         });
         res.sendStatus(200);
     }
})
});

app.get('/api/getbooks/:user', function(req,res){
     User.findById(req.params.user,function(err,user){
     if(err)console.log(err);
     res.end("" + user.books);
         
     });
});

app.get('/profile',function(req, res) {
    res.render('profile.ejs');
});

app.post('/profile',function(req,res){
     User.findById(req.user,function(err,user){
          if(err)console.log(err);
          else{
            user.city = req.body.cityField;
            user.statecountry = req.body.stateField;
            user.save(function(err,user){
                if(err){
                    console.log(err);
                }
            })
            res.redirect('/profile');
          }
     });
});


//to compile less at command line for this project:
// $ lessc bootstrap/bootstrap.less public/stylesheets/bootstrap.css
//to minify js 
//minify public/sylesheets/bootstrap.css public/stylesheets/bootstrap.min.css

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});