const router = require("express").Router();
const UserModel = require("../model/usermodel");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();

const secret = process.env.SECRET


// used to verify user at the time incoming request (like: edit profile)
const verification =async (req, res, next)=>{
    try {
        const token = req.headers["authorization"];

        if(!token){
            return res.json({
                status:"Session expired"
            })
        }
        const verify = JWT.verify(token,secret);
        if(verify){
            next();
        } else{
            return res.json({
                status:"Session expired"
            })
        }

    } catch (error) {
        res.status(422).json({
            status:"failed",
            message:error.message
        })
    }
}

// resgister new user if valid, with username, email, password
router.post("/register", async(req,res)=>{
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        return res.json({
            status:"Enter full details"
        })
    }
    try {
        const userexist = await UserModel.findOne({email:email});
        if(userexist){
            return res.json({
                status:"User email already in use, Please try different email"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await UserModel.create({
            username:username,
            email:email,
            password:hash
        })
        res.json({
            status:"successfull",
        })
        
    } catch (error) {
        res.status(422).json({
            status:"failed",
            message:error.message
        })
    }
})

// login with email and password, jwt for token generation 
router.post("/login", async(req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.json({
            status:"Enter full details"
        })
    }
    try {
        const user = await UserModel.findOne({email:email});
        const pass = await bcrypt.compare(password,user.password)
        if(pass==true){
            const token = JWT.sign({user},secret);
            res.json({
                status:"login successfull",
                token
            })
        } else {
            res.json({
                status:"Invalid credentials"
            })
        }
    } catch (error) {
        res.status(422).json({
            status:"failed",
            message:error.message
        })
    }
})

// edit profile for three parameters or anyone of them if detail is valid
router.patch("/editprofile/:email", verification, async(req,res)=>{
    const useremail = req.params.email;
    const {username, email, password} = req.body;
    if(!username && !email && !password){                             // if no details enter
        return res.json({
            status:"failed",
            message:"Enter details to update"
        })
    }
    try {
        if(email && useremail == email){                             // if email is same as before
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password,salt);
            const user = await UserModel.updateOne({email:useremail},{
                username:username,
                email:email,
                password:hash
            })
            return res.json({
                status:"successfull",
                message:"Profile has been updated, Please login again "
            })
        }
        const userexist = await UserModel.findOne({email:email});
        if(userexist){                                              // if another user already using the entered email   
            return res.json({
                status:"Email already in use by someone else"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);
        const user = await UserModel.updateOne({email:useremail},{ // if everything is valid
            username:username,
            email:email,
            password:hash
        })
        res.json({
            status:"successfull",
            message:"Please login again"
        })
    } catch (error) {
        res.status(422).json({
            status:"failed",
            message:error.message
        })
    }
})

// show all the users
router.get("/allusers", async(req,res)=>{
    try {
        const users = await UserModel.find();
        if(users.length === 0){
            return res.json({
                status:"successfull",
                message:"no user exists"
            })
        }
        res.json({
            status:"successfull",
            users
        })
    } catch (error) {
        res.status(422).json({
            status:"failed"
        })
    }
})



module.exports = router;