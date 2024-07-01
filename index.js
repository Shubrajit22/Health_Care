const express = require('express')
const dotenv = require('dotenv')
const app = express();
const userModel=require("./models/user.model")
const postModel = require("./models/post.model")
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const path=require('path')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'images')));
const server = createServer(app);
const io = new Server(server);
app.use(express.json());   
app.use(express.urlencoded({ extended:true})) 
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home')
})
app.get("/user",
    (req,res)=>{
        res.render('index')
    }
)

app.post("/create", async(req, res) => {
    let{name,email,password}=req.body;
    let user=await userModel.findOne({email})
   if(user) return res.status(500).send("User already exists")
   
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
         let user=  await userModel.create({
                name:name,
                email:email,
                password:hash
            });
          let token=  jwt.sign({email:email,userid:user._id},"shhhh")
          res.cookie("token",token)
          res.send('registered')
        })
    })
   
   
})
//ROUTES FOR LOG IN PAGE
app.get("/login",(req, res)=>{
 res.render('login')    
})

//ROUTES FOR CREATING USER
app.post("/register",async(req,res)=>{
    let{email,password}=req.body;
    let user=await userModel.findOne({email})
   if(!user) return res.render('index')


    bcrypt.compare(password,user.password,(err,result)=>{
        if(result){
            let token=  jwt.sign({email:email,userid:user._id},"shhhh")
            res.cookie("token",token)
            res.redirect('admin')
           //res.redirect('profile')
           // res.render('profile')
        }
        else{
           res.status(500).send("Something went wrong").redirect('index')
          
        }
    })
})
//Routes to LOG OUT
app.get("/logout",(req, res)=>{
 res.clearCookie("token")
 res.send('logged out')    
})
//creating protected route
function isloggedin(req,res,next){
    //console.log('hii')
    try {
        token_str = req.headers.cookie;
        token = token_str.split("=")[1]
        console.log(token)
        if(token==="") res.send('you must be logged in')
        else{
          let data =  jwt.verify(token,"shhhh")
          req.user= data;  
          next();
        }
         
    } catch (err) {
        console.log('err')
        res.redirect('login')
    }
  
}
//ROUTES FOR ADMIN PAGE OR DASHBOARD
app.get("/profile",isloggedin,async(req,res)=>{
  let user =await userModel.findOne({email: req.user.email});
   console.log(user);
    res.render('profile');
 })
 app.get('/admin',isloggedin,async(req,res)=>{
    let user =await userModel.findOne({email: req.user.email});
   console.log(user);
    
    res.render('admin',{user})
})
// socket.io implementation
io.on('connection', (socket) => {
    io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
          io.emit('chat message', msg);
        });
      });
        
      
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
});
   
////video socket
// const userManager = new UserManager();

// io.on('connection', (socket) => {
//   console.log('a user connected');
//   userManager.addUser("randomName", socket);
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//     userManager.removeUser(socket.id);
//   })
// });


let port=process.env.PORT||3000

server.listen(port, () => {
    console.log('Server is running on ${port} 3000')
})
//server.listen(3000, '192.168.29.148');