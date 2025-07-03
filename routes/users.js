const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authMiddleware =require('../middleware/authMiddleware');


// CRUD Operations

// READ (View Users)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// CREATE (Add New User)
router.post('/users', async (req, res) => {
    try {
        const { name, age, weight } = req.body;  

        // Validate input
        if (!name || !age) {
            return res.status(400).json({
                success: false,
                message: "Name and age are required!"
            });
        }

        const newUser = new User({ name, age, weight });  
        await newUser.save();  

        res.status(201).json(newUser);  
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// UPDATE (Modify User)
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, weight } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { name, age, weight }, { new: true });

        if (!updatedUser) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}); // ✅ Added missing closing `}` for the catch block

//delete

router.delete('/users/:id',async(req,res)=>{
    const {id}=req.params;
    try{
        const deletedUser=await User.findByIdAndDelete(id);

        if(!deletedUser){
             res.json({
                message:"user not found" 
             })
        }
        //if user found and deleted 
        res.status(200).json({
            success:true,
            user:deletedUser
        })

    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

/// get user from userId
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id, "-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



module.exports = router;
