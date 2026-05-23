/**
 * Standardized response handler
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Boolean} success - Success flag
 * @param {String} message - Response message
 * @param {Any} data - Optional response data
 */
exports.sendResponse = (res, statusCode, success, message, data = null) => {
    const response = {
        success,
        message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

/**
 * Standardized pagination handler
 * @param {Object} model - Mongoose model
 * @param {Object} query - Mongoose query object
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Array} populateOptions - Options for population
 */
exports.getPaginatedData = async (model, query = {}, page = 1, limit = 10, populateOptions = [], sort) => {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10) || 10;

    let dbQuery = model.find(query);
    if (sort) dbQuery = dbQuery.sort(sort);
    dbQuery = dbQuery.skip(skip).limit(parsedLimit);

    if (populateOptions.length > 0) {
        populateOptions.forEach(option => {
            dbQuery = dbQuery.populate(option);
        });
    }

    const [list, totalItems] = await Promise.all([
        dbQuery,
        model.countDocuments(query)
    ]);

    return {
        list,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / parsedLimit) || 1,
            currentPage: parseInt(page, 10),
            itemsPerPage: parsedLimit
        }
    };
};

/**
 * Handle async errors (simpler alternative to express-async-handler if not using it)
 */
exports.asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
