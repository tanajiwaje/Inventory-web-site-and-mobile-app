import { API_BASE_URL } from '../config';
import { CompanySettings } from '../types';

export const getPublicCompany = async (): Promise<CompanySettings | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/company`);
    if (!res.ok) return null;
    return (await res.json()) as CompanySettings;
  } catch {
    return null;
  }
};
