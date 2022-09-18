const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

//For backend data validation 
const {  check,validationResult } = require('express-validator');
//importing User Model
const User = require('../Models/Users.js')
//Multer used for file storing and uploading in db 
const multer = require('multer');


// setting multer for storing uploaded files

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });







//route for getting all the users from the Db
router.get('/getUsers', async (req, res) => {

    try {

        const allData = await User.find()
        res.json(allData)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }




})

//Getting User by id 
router.get('/getUser/:id', async (req, res) => {

    try {

        const { id } = req.params

        const oneUser = await User.findById(id)

        res.json(oneUser)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }




})

// Adding user 

router.post('/adduser',

    upload.single('uploadProfileImage'),

    [
        check('name', 'please enter a vlid name')
            .exists()
            .isLength({ min: 3 }),
        check('age', 'please enter age')
            .exists()
            ,
        check('phone', 'please enter valid phone number')
            .exists(),
        check('profileImage','please select a vlid image')
        .exists()
            
    ]

    ,

    async (req, res, next) => {

        try {


            //if required parameter don'e meet api will throw error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            //Destructuring data from request
            const { name, age, phone } = req.body
            const { filename } = req.file


            //adding user details in the Db
            const AddedUser = await User.create({
                name,
                phone,
                age,
                profileImage: {
                    // data: fs.readFileSync(path.join(__dirname + '/uploads/' + filename)),
                    data: fs.readFileSync(path.join(__dirname, "../", '/uploads/' + filename)),
                    contentType: "image/png"
                }
            })

            //sending added user in response
            res.json(AddedUser)





        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }


    });



//updating user

router.put('/updateuser/:id', upload.single('uploadProfileImage'), async (req, res) => {



    try {



        // Create a new User  object
        const { name, phone, age, profileImage } = req.body;
        // const { filename } = req.file
        const updatingUser = {};
        if (name) { updatingUser.name = name };
        if (phone) { updatingUser.phone = phone };
        if (age) { updatingUser.age = age };
        if (profileImage) {


            updatingUser.profileImage = {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                // contentType: "image/png"
            }

        }

        // Find the user to be updated and update it

        const { id } = req.params

        const updatedUser = await User.findByIdAndUpdate(id, { $set: updatingUser }, { new: true })
        res.send(`put request ${updatedUser} `)


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }



})


//Deleting User

router.delete("/deleteuser/:id", async (req, res) => {

    try {

        const { id } = req.params

        const deleteduser = await User.findByIdAndDelete(id, { new: true })
        res.send(`delete request ${deleteduser} `)


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})






module.exports = router