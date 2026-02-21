import { CompanySettings } from '../../shared/types';

const getBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000';

export const getPublicCompanySettings = async (): Promise<CompanySettings> => {
  const res = await fetch(`${getBaseUrl()}/api/public/company`);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return (await res.json()) as CompanySettings;
};
