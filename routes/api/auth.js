
const express = require('express')
const router = express.Router()

//@route GEt api/auth
//@desc Test route
//access value for public or private

router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;
