const LearningResource = require('../models/LearningResource');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');

const getAllResources = async (req, res, next) => {
  try {
    const { topic, targetAudience, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isPublished: true };
    if (topic) filter.topic = topic;
    if (targetAudience && targetAudience !== 'all') filter.targetAudience = targetAudience;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const [resources, total] = await Promise.all([
      LearningResource.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      LearningResource.countDocuments(filter),
    ]);

    return sendSuccess(res, resources, 'Resources retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id)
      .populate('createdBy', 'name role')
      .lean();

    if (!resource || !resource.isPublished) {
      return sendError(res, 'Learning resource not found', 404);
    }

    return sendSuccess(res, resource, 'Learning resource retrieved');
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const resource = new LearningResource({
      ...req.body,
      createdBy: req.user._id,
    });
    await resource.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'RESOURCE_CREATED',
      details: { resourceId: resource._id, title: resource.title },
      ipAddress: req.ip || '',
    });

    return sendSuccess(res, resource, 'Resource published successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return sendError(res, 'Resource not found', 404);
    }

    if (req.user.role !== 'admin' && resource.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this resource', 403);
    }

    Object.assign(resource, req.body);
    await resource.save();

    return sendSuccess(res, resource, 'Resource updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return sendError(res, 'Resource not found', 404);
    }

    if (req.user.role !== 'admin' && resource.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this resource', 403);
    }

    await LearningResource.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'Resource deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};
