const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc      Get matched users
// @route     GET /api/match
// @access    Private
exports.getMatches = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const currentUser = await User.findById(req.user.id);

  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  const allUsers = await User.find({ _id: { $ne: req.user.id } })
    .sort({ 'rating.average': -1, createdAt: -1 });

  const currentUserOfferedSkills = currentUser.skillsOfferedSimple || [];
  const currentUserWantedSkills = currentUser.skillsWantedSimple || [];

  const scoredMatches = allUsers
    .map((user) => {
      let score = 0;
      const userOfferedSkills = user.skillsOfferedSimple || [];
      const userWantedSkills = user.skillsWantedSimple || [];

      // Count exact matches
      const offeredMatches = userOfferedSkills.filter(skill =>
        currentUserWantedSkills.includes(skill.toLowerCase())
      ).length;

      const wantedMatches = userWantedSkills.filter(skill =>
        currentUserOfferedSkills.includes(skill.toLowerCase())
      ).length;

      score = offeredMatches * 2 + wantedMatches * 2;

      // Bonus for high ratings
      if (user.rating.average > 4) score += 1;

      return {
        ...user.toJSON(),
        matchScore: score,
        matchDetails: {
          offeredMatches,
          wantedMatches,
          totalMatches: offeredMatches + wantedMatches
        }
      };
    })
    .filter((user) => user.matchScore > 0)
    .sort((a, b) => b.matchScore - a.score);

  const paginated = scoredMatches.slice(skip, skip + limit);

  return successResponse(res, {
    data: {
      matches: paginated,
      pagination: buildPaginationMeta({ page, limit, total: scoredMatches.length }),
    },
  });
});
