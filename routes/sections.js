const express  = require('express');
const {getSections, getSection, createSection, updateSection, deleteSection} = require('../controllers/sections');
const router = express.Router({mergeParams: true});
const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, getSections).post(protect, authorize('admin'), createSection);
router.route('/:id').get(protect, getSection).put(protect, authorize('admin'), updateSection).delete(protect, authorize('admin'), deleteSection);

module.exports = router;