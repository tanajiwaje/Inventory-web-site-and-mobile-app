import { Request, Response, NextFunction } from 'express';

import * as locationsService from '../services/locationsService';

export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await locationsService.getLocations(req.query as { page?: string; limit?: string });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await locationsService.createLocation(req.body);
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await locationsService.updateLocation(req.params.id, req.body);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await locationsService.deleteLocation(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
