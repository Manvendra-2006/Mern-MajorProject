const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { resourceSchema } = require('../validators/resource.validator');

// Public endpoints
router.get('/', optionalAuth, resourceController.getAllResources);
router.get('/:id', optionalAuth, resourceController.getResourceById);

// Teacher & Admin management
router.post(
  '/',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  validate(resourceSchema),
  resourceController.createResource
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  validate(resourceSchema.partial()),
  resourceController.updateResource
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher', 'admin'),
  resourceController.deleteResource
);

module.exports = router;
