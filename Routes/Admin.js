const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

//For backend data validation 
const { check, validationResult } = require('express-validator');
//importing User Model
const User = require('../Models/Users.js');
const { APPSECRET } = require('../config/config.js');


// Registering a admin user 

router.post('/Register',



    [
        check('name', 'please enter a vlid name')
            .exists()
            .isLength({ min: 3 }),
        check('email', 'please enter a vlaid email')
            .exists()
        ,
        check('password', 'please enter valid password')
            .exists()
            .isLength({ min: 8 })


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
            const { name, email, password, role } = req.body;



            // Checking whether the user with this email exists already
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ error: "This email already exists" })
            }


            else {

                // encrypting password 

                const encrptedpassword = await bcrypt.hash(password, 10);



                //adding user details in the Db
                const AddedUser = await User.create({
                    name,
                    email,
                    password: encrptedpassword,
                    role: "admin"
                })

                //sending added user in response
                res.json({
                    message: 'User Registerd Successfully',
                    data: AddedUser
                })

            }






        } catch (error) {


            res.status(500).json({ message: error.message })

        }


    });




//  Authenticating a admin User using 
router.post('/login',
    [

        check('email', 'please enter a vlaid email')
            .exists()
        ,
        check('password', 'please enter valid password')
            .exists()
            .isLength({ min: 8 })


    ]

    , async (req, res) => {
        let success = false;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                success = false
                return res.status(400).json({ error: "Please try to login with correct credentials" });
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                success = false
                return res.status(400).json({ success, error: "Please try to login with correct credentials" });
            }

            const data = {
                user: {
                    id: user.id,
                    role: user.role
                }
            }


            const authtoken = jwt.sign(data, APPSECRET);
            success = true;
            res.json({ success, authtoken, username: user.name })

        } catch (error) {
            res.status(500).json({ message: error.message })

        }


    });

module.exports = router