class APIError extends Error {                         // custom API error class jab bhi koi error throw karna ho like status code dekhna ho tabhi hum iska use karete hai
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""                                             // optional stack trace
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;                                     // default data property
        this.message = message;
        this.success = false;
        this.error = error;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { APIError };