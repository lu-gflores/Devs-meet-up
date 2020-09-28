const express = require('express')
const router = express.Router()

//@route GEt api/profile
//@desc Test route
//access value for public or private

router.get('/', (req, res) => res.send('Post route'));

module.exports = router;
