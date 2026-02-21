import * as usersRepo from '../repositories/usersRepository';
import { Supplier } from '../models/Supplier';
import { Customer } from '../models/Customer';

export const listPendingUsers = () => usersRepo.findPending();

export const approveUser = async (userId: string) => {
  const user = await usersRepo.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  if (user.status === 'approved') {
    return user;
  }

  if (user.role === 'seller' && !user.supplierId) {
    const supplier = await Supplier.create({
      name: user.companyName || user.name,
      contactName: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address
    });
    user.supplierId = supplier._id;
  }

  if (user.role === 'buyer' && !user.customerId) {
    const customer = await Customer.create({
      name: user.companyName || user.name,
      contactName: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address
    });
    user.customerId = customer._id;
  }

  user.status = 'approved';
  await user.save();
  return user;
};

export const rejectUser = async (userId: string) => {
  const user = await usersRepo.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }
  user.status = 'rejected';
  await user.save();
  return user;
};
