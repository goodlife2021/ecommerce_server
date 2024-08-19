const { User } = require('../models/user');
const { ImageUpload } = require('../models/imageUpload');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const multer = require('multer');
const fs = require("fs");

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
  });
  
  var imagesArr = [];
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
      //imagesArr.push(`${Date.now()}_${file.originalname}`)
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];
  
    try {
      for (let i = 0; i < req?.files?.length; i++) {
        const options = {
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        };
  
        const img = await cloudinary.uploader.upload(
          req.files[i].path,
          options,
          function (error, result) {
            imagesArr.push(result.secure_url);
            fs.unlinkSync(`uploads/${req.files[i].filename}`);
          }
        );
      }
  
      let imagesUploaded = new ImageUpload({
        images: imagesArr,
      });
  
      imagesUploaded = await imagesUploaded.save();
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  });
  



router.post(`/signup`, async (req, res) => {
    const { name, phone, email, password, isAdmin } = req.body;

    try {

        const existingUser = await User.findOne({ email: email });
        const existingUserByPh = await User.findOne({ phone: phone });

        if (existingUser || existingUserByPh) {
            res.status(400).json({error:true, msg: "User already exist!" })
        }

        const hashPassword = await bcrypt.hash(password,10);

        const result = await User.create({
            name:name,
            phone:phone,
            email:email,
            password:hashPassword,
            isAdmin:isAdmin
        });

        const token = jwt.sign({email:result.email, id: result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        res.status(200).json({
            user:result,
            token:token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({error:true, msg:"something went wrong"});
    }
})



router.post(`/signin`, async (req, res) => {
    const {email, password} = req.body;

    try{

        const existingUser = await User.findOne({ email: email });
        if(!existingUser){
            res.status(404).json({error:true, msg:"User not found!"})
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if(!matchPassword){
            return res.status(400).json({error:true,msg:"Password wrong"})
        }

        const token = jwt.sign({email:existingUser.email, id: existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

       return res.status(200).send({
            user:existingUser,
            token:token,
            msg:"User Login Successfully!"
        })

    }catch (error) {
        res.status(500).json({error:true,msg:"something went wrong"});
    }

})



module.exports = router;