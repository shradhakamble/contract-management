// Middleware to authenticate users based on profile_id from the request header
// Retrieves the user profile from the database and attaches it to req.profile

const { UnauthorizedError, BadRequestError } = require('../utils/errors');

const getProfile = async (req, res, next) => {
    try {
        const { Profile } = req.app.get('models');
        const profileId = parseInt(req.get('profile_id') || req.query.profile_id, 10);

        if (!profileId || isNaN(profileId)) {
            // If  profile_id is missing or invalid
            throw new BadRequestError('Missing or invalid profile_id in header');
        }

        // Find the profile associated with the given profile_id
        const profile = await Profile.findOne({ where: { id: profileId}});

        if (!profile) {
            // If no profile found, return unauthorized
            throw new UnauthorizedError('Unauthorized: Profile not found');
        }

        req.profile = profile; // Attach authenticated profile to request
        next();
    } catch (error) {
        next(error); // Pass the error to the centralized error handler
    }
};

module.exports = { getProfile };