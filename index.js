const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
 const PORT = 3500
const bodyparser = require('body-parser') 
require('./db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User = require('./MODELS/auth')


app.use(cookieParser())
app.use(cors())
app.use(bodyparser.json())

app.get('/', (req, res) => {
    res.send('API IS working')
})



function authtoken (req ,res , next) {

const token = req.header.authorization;
const {id} = req.body
 
 if(!token) 
  return   res.status(401).json({message: "invalid token"})
 

try{

  const decode =   jwt.verify(token, process.env.JSON_WEB_SECRET)
  if(id && decode.id !== id) {
    console.log('invalid token')
  }

  req.id = decode
  next()

}
catch(err){
         console.log(err)
         res.status(401).json({message: "invalid token"})
}


}




app.post('/register', async (req, res) => {
    try{
        const {username, password, email, age, gender} = req.body;
        const existinguser = await User.findOne({email})

        if(existinguser){
           return  res.status(409).json({message: "user already exist"})
        }
         
        const  salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt)

        console.log('salt:', salt)
        console.log('hashpassword:', hashpassword )

        const newuser = new User({
            username, 
            password: hashpassword, 
            email,
             age, 
             gender
        })

        await newuser.save()
      return res.status(200).json({message: "new user has been created"})

    }
    catch (err) {
      res.status(500).json({ message: err.message });
    }

})






app.post("/login", async(req,res) => {
    try{
       const {email, password} = req.body;
       const existinguser = await User.findOne({email})

       if(!existinguser) {
        return res.status(500).json({message: "user those not eist"})
       }


       const checkpassword = await bcrypt.compare(password, existinguser.password)

       if(!checkpassword) {
        return  res.status(500).json({message: "invalid password"})
       }


     const accesstoken = jwt.sign({id: existinguser._id}, process.env.JSON_WEB_SECRET, {
        expiresIn: "1h"
    })


    const refreshtoken = jwt.sign({id: existinguser._id}, process.env.JSON_REFRESH_WEB_SECRET)
    existinguser.refreshtoken = refreshtoken
     await existinguser.save()
     res.cookie('refreshtoken', refreshtoken, {httpOnly: true, path: './refresh_token'})


    res.status(200).json({   
        accesstoken,
        refreshtoken,
        message: "login succesful"
    })
   
     
   

    }
    catch(err){ 
        res.status(500).json({message: err.message})
    }
})


app.get('/getmyprofile', authtoken, async (req, res) => {
    const {id} = req.body
    const user = await User.findById(id)
    user.password = undefined
    res.status(200).json({user})
})




app.get('/refresh_token', async(req, res, next) => {
    const token = req.cookies.refreshtoken
    if(!token) {
      return res.status(404).json({message: "no token found"})
    }

    try{
            const decoded =   jwt.verify(token, process.env.JSON_REFRESH_WEB_SECRET )

              if(id && decoded.id !== id) {
                console.log('invalid token')
              }
              
              const id = decoded.id
             const existinguser = await User.findById(id)
              if(!existinguser || token !== existinguser.refreshtoken){
                console.err('invalid token')
              }

              const accesstoken = jwt.sign({id: existinguser._id}, process.env.JSON_WEB_SECRET, {
                expiresIn: "1h"
            })
        
        
            const refreshtoken = jwt.sign({id: existinguser._id},  process.env.JSON_REFRESH_WEB_SECRET,)
            existinguser.refreshtoken = refreshtoken
             await existinguser.save()
             res.cookie('refreshtoken', refreshtoken, {httpOnly: true, path: './refresh_token'})
        
        
            res.status(200).json({
                accesstoken,
                refreshtoken,
                message: "login succesful"
            })



              next()
    }

    catch(err){
             res.status(401).json({message: err.message})
    }
})




app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})

