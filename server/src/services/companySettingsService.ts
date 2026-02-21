import { CompanySettings } from '../models/CompanySettings';

const defaultSettings = {
  name: 'Inventra',
  tagline: 'Inventory you can trust',
  description:
    'Track stock, suppliers, and orders in one place. Real-time visibility across your inventory operations.',
  websiteUrl: 'https://example.com'
};

export const getSettings = async () => {
  let settings = await CompanySettings.findOne();
  if (!settings) {
    settings = await CompanySettings.create(defaultSettings);
  }
  return settings;
};

export const updateSettings = async (payload: Record<string, unknown>) => {
  const existing = await CompanySettings.findOne();
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return CompanySettings.create({ ...defaultSettings, ...payload });
};
