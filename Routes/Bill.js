const express = require('express');
const router = express.Router();

//For backend data validation 
const { check, validationResult } = require('express-validator');
const authUser = require('../Middleware/authUser.js');
//importing User Model
const Bill = require('../Models/Bills.js')




//route for getting all the users from the Db
router.get('/getallbills', async (req, res) => {

    try {

        const AllBills = await Bill.find()
        res.json(AllBills)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message })
    }




})

//Getting User by id 
router.get('/getbill/:id', async (req, res) => {

    try {

        const { id } = req.params

        const oneUser = await Bill.findById(id)

        res.json(oneUser)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message })
    }




})

// creating bill 

router.post('/generatebill',



    [
        check('name', 'please enter a vlid name')
            .exists()
            .isLength({ min: 3 }),
        check('billno', 'please enter a valid bill Number')
            .exists()
        ,
        check('product', 'please enter valid product name')
            .exists()
            .isLength({ min: 5 })

        ,
        check('price', 'please select a vlid price')
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
            const { name, billno, product, price } = req.body





            // Checking whether the user with this Bill exists already
            let isbillduplicate = await Bill.findOne({ billno });
            if (isbillduplicate) {
                return res.status(400).json({ error: "This Bill no. already exists" })
            }


            //adding Bill details in the Db
            const AddedBill = await Bill.create({
                name,
                billno,
                product,
                price

            })

            //sending added Bill in response
            res.json({
                message: 'Bill generated  Successfully',
                data: AddedBill
            })





        } catch (error) {


            res.status(500).json({ message: error.message })

        }


    });



// //updating user

router.put('/updatebill/:id', async (req, res) => {



    try {



        //Destructuring data from request
        const { name, billno, product, price } = req.body


        const updatingBill = {};
        if (name) { updatingBill.name = name };
        if (billno) { updatingBill.billno = billno };
        if (product) { updatingBill.product = product };
        if (price) { updatingBill.price = price };

        // Find the bill to be updated and update it

        const { id } = req.params

        const updatedBill = await Bill.findByIdAndUpdate(id, { $set: updatingBill }, { new: true })

        res.json({
            message: "Bill updated  Successfully",
            data: updatedBill
        })



    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message })
    }



})


// //Deleting User

router.delete("/deletebill/:id", authUser, async (req, res) => {

    try {

        const { id } = req.params
        const { role } = req.user
        if (role == "admin") {
            const deletedBill = await Bill.findByIdAndDelete(id, { new: true })


            res.json({
                message: "Bill Deleted  Successfully",
                data: deletedBill
            })


        } else {
            res.status(401).json({ message: "you are not authorized" })


        }





    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message })
    }

})






module.exports = router