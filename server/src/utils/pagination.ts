export const parsePagination = (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationResult = (total: number, page: number, limit: number) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
};
