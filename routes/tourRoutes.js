const express = require('express')
const tourController = require('./../controllers/tourController')



const router = express.Router()

// params参数中间件
// router.param('id', tourController.checkId)
// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack 

// 简化
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthlu-plan/:year').get(tourController.getMonthlyPlan)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

module.exports = router