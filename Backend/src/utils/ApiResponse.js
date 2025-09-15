class ApiResponse {
    constructor(statusCode, message = "Success", data = null, errors = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;

        if (errors) {
            this.errors = errors;
        }
    }
}

export { ApiResponse };
