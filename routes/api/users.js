const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
//@route POST api/users
//@desc register new user
//access value for public or private

router.post('/',
    [
        check('name', 'Name is required!').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({
            min: 6
        })
    ],
    (req, res) => {
        const errors = validationResult(req);
        //if the parameters above does not match, send status 400
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        res.send('User route')
    });

module.exports = router;
