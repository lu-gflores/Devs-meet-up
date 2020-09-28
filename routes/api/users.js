const express = require('express')
const router = express.Router()

//@route GEt api/users
//@desc Test route
//access value for public or private

router.get('/', (req, res) => res.send('User route'));

module.exports = router;
