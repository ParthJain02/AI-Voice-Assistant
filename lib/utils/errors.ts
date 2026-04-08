export class AppError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMITED");
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }

  return Response.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
}
