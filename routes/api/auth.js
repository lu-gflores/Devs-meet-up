const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');
const User = require('../../models/User');
//@route GET api/auth
//@desc auth user and get token
//access value for public`

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


//@route GET api/auth
//@desc auth user and get token
//access value for public`
router.post('/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        //if the parameters above does not match, send status 400
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;
        try {
            //see if user exists
            let user = await User.findOne({ email })
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            //compare user password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
                if (err) throw err;
                res.json({ token })
            })

        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }
    });

module.exports = router;
