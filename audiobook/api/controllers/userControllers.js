const mongoose = require('mongoose'),
User = require('../models/user'),
Comment = require('../models/comment'),
Rating = require('../models/rating');

module.exports = {
    total: (req, res) => {
        User.countDocuments().then(
            count => {
                res.status(200).json({total: count});
            }
        )
    },
    show: (req, res) => {
        User.findById(req.params.id).then(
            user => {
                Comment.find({user: req.params.id}).populate('book').then(
                    comments => {
                        Rating.find({user: req.params.id}).populate('book').then(
                            ratings => {
                                res.status(200).json({user: user, comments: comments, ratings: ratings});
                            }
                        ).catch(error => {
                            res.status(500).json({error: error})
                        })
                    }
                ).catch(error => {
                    res.status(500).json({error: error})
                })
            }
        ).catch(error => {
            res.status(500).json({error: error})
        })
    },
    update: (req, res) => {
        let updateContent = {}
        Object.keys(req.body).forEach(field => {
            updateContent[field]=req.body[field]
        })

        User.findByIdAndUpdate(req.params.id, {$set:updateContent}).then(
            user => {
                res.status(200).json({user: user});
            }
        ).catch(error => {
            res.status(500).json({error: error})
        })
    }
}