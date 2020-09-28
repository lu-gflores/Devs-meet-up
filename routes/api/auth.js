const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth');
const User = require('../../models/User');
//@route GEt api/auth
//@desc Test route
//access value for public or private

//route is protected thanks to auth
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

module.exports = router;
