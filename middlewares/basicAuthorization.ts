/* eslint-disable import/prefer-default-export */
import express from "express";

export const authAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.user === undefined || !req.user.isAdmin) {
    return res.status(403).json("Forbidden");
  }

  return next();
};

export const authAdminOrOwner = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (
    req.user === undefined ||
    (!req.user.isAdmin && parseInt(req.params.id, 10) !== req.user.id)
  ) {
    return res.status(403).json("Forbidden");
  }

  return next();
};
