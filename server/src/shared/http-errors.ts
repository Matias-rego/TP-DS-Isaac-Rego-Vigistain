export class HttpError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) { super(message, 404); }
}

export class ConflictError extends HttpError {
    constructor(message: string) { super(message, 409); }
}