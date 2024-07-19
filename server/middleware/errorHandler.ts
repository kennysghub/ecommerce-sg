import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" },
  };
  if (err instanceof Error) {
    // If err is an instance of Error, override the default message
    const errorObj = {
      ...defaultErr,
      message: err.message,
    };
    console.log(errorObj.log);
    return res.status(errorObj.status).json({ err: errorObj.message });
  } else {
    // If err is not an Error, use the default error object
    console.log(defaultErr.log);
    return res.status(defaultErr.status).json({ err: defaultErr.message });
  }
};
