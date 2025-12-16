const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));                // catch errors and pass to next middleware
    };
};
export { asyncHandler };