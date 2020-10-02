const express = require('express')
const router = express.Router()
const request = require('request')
const config = require('config')
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')
const { check, validationResult } = require('express-validator')
//@route GEt api/profile/me
//@desc  get current users profile
//access private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'No profile for this user found.' })
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
});


//@route POST api/profile/
//@desc  Create/UPdate user profile
//access private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    //grabbing everything from the body of the user
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
    //builds profile object that will be inserted in the database
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    //build social object that will also be inserted in the database
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            //update profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            return res.json(profile)
        }

        //create profile
        profile = new Profile(profileFields);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

//@route GET api/profile/
//@desc  Get all profiles
//access public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//@route GET api/profile/user:user_id
//@desc  Get profile by user ID
//access public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: 'No profile found on this user' })
        res.json(profile)
    } catch (err) {
        console.error(err.message);

        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'No profile found on this user' })
        }
        res.status(500).send('Server Error')
    }
});

//@route DELETE api/profile
//@desc  Delete profile, user and posts
//access private
router.delete('/', auth, async (req, res) => {
    try {

        //remove posts from user
        await Post.deleteMany({ user: req.user.id })

        //removes profile
        await Profile.findOneAndRemove({ user: req.user.id })
        //removes user
        await User.findOneAndRemove({ _id: req.user.id })
        res.json({ msg: 'User Deleted' })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//@route PUT api/profile/experience
//@desc  Add profile experience 
//access private
router.put('/experience', [auth, [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    //pulling from object
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;
    //creates an object with the data the user submits
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.err(err.message)
        res.status(500).send('Server Error')
    }

})


//@route DELETE api/profile/experience/:exp_id
//@desc  delete profile experience 
//access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile)
    } catch (err) {
        console.err(err.message)
        res.status(500).send('Server Error')
    }
})

//@route DELETE api/profile/education/:education_id
//@desc  add profile education  
//access private
router.put('/education', [auth, [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'field of study is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    //pulling from object
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;
    //creates an object with the data the user submits
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.err(err.message)
        res.status(500).send('Server Error')
    }
})
//@route DELETE api/profile/education/:edu_id
//@desc  delete profile education 
//access private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);

        await profile.save();
        res.json(profile)
    } catch (err) {
        console.err(err.message)
        res.status(500).send('Server Error')
    }
})

//@route Get api/profile/github/:username
//@desc  Get user repos from github 
//access public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: "GET",
            headers: { 'user-agent': 'node.js' }
        }
        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.statusCode(404).json({ msg: 'No Github profile found' })
            }
            res.json(JSON.parse(body));

        })
    } catch (err) {
        console.err(err.message)
        res.status(500).send('Server Error')
    }
})
module.exports = router;
