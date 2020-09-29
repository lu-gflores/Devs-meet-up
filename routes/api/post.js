const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
//@route POST api/posts
//@desc creating post
//access private

router.post('/', [auth, check('text', 'Text is required').not().isEmpty()], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save()
        res.json(post)
    } catch (err) {
        console.error(err.mesage)
        res.status(500).send('Server Error')
    }
});

//@route GET api/posts
//@desc Get all posts
//access private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts)
    } catch (err) {
        console.error(err.mesage)
        res.status(500).send('Server Error')
    }
})


//@route GET api/posts/:id
//@desc Get post by id
//access private

router.get('/:id', auth, async (req, res) => {
    try {
        const posts = await Post.findById(req.params.id);

        if (!posts) {
            return res.status(404).json({ msg: 'Post Not Found' });
        }

        res.json(posts)
    } catch (err) {
        console.error(err.mesage)
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        res.status(500).send('Server Error')
    }
})

//@route Delete api/posts/:id
//@desc Delete post 
//access private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post Not Found' });
        }

        //check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }
        await post.remove();
        res.json({ msg: 'Post removed' })
    } catch (err) {
        console.error(err.mesage)
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        res.status(500).send('Server Error')
    }
})

//@route PUT api/posts/like/:id
//@desc  Like a post
//access private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //checking if the post has been liked by specific user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ mgs: 'Post already liked' })
        }
        post.likes.unshift({ user: req.user.id })
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//@route PUT api/posts/unlike/:id
//@desc  unlike a post
//access private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //checking if the post has been unliked by specific user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ mgs: 'Post has not been liked' })
        }

        //remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1)

        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})
module.exports = router;
