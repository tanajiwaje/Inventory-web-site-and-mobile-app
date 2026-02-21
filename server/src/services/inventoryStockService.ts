import * as stockRepo from '../repositories/inventoryStockRepository';
import * as locationsRepo from '../repositories/locationsRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';

const getDefaultLocation = async () => {
  const defaultLocation = await locationsRepo.findAll().then((list) => list.find((l) => l.isDefault));
  if (!defaultLocation) {
    const error = new Error('Default location not configured');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  return defaultLocation;
};

export const adjustStock = async (payload: {
  itemId: string;
  locationId?: string;
  delta: number;
}) => {
  const location = payload.locationId
    ? { _id: payload.locationId }
    : await getDefaultLocation();

  const existing = await stockRepo.findByItemAndLocation(payload.itemId, String(location._id));
  if (existing) {
    const newQty = existing.quantity + payload.delta;
    if (newQty < 0) {
      const error = new Error('Insufficient stock for this location');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }
    await stockRepo.updateById(existing._id, { quantity: newQty });
  } else {
    if (payload.delta < 0) {
      const error = new Error('Insufficient stock for this location');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }
    await stockRepo.create({
      item: payload.itemId,
      location: location._id,
      quantity: payload.delta
    });
  }

  return true;
};

export const getStockPaged = async (query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    stockRepo.findPaged(skip, limit),
    stockRepo.count()
  ]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};
