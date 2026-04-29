const { getPagination, buildPaginationMeta } = require('../../src/utils/pagination');

describe('Pagination utilities', () => {
  it('should return default pagination values', () => {
    const { page, limit, skip } = getPagination({});

    expect(page).toBe(1);
    expect(limit).toBe(10);
    expect(skip).toBe(0);
  });

  it('should calculate skip and validate limits', () => {
    const { page, limit, skip } = getPagination({ page: '2', limit: '25' });

    expect(page).toBe(2);
    expect(limit).toBe(25);
    expect(skip).toBe(25);
  });

  it('should build pagination metadata correctly', () => {
    const meta = buildPaginationMeta({ page: 2, limit: 10, total: 45 });

    expect(meta).toEqual({
      page: 2,
      limit: 10,
      total: 45,
      totalPages: 5,
    });
  });
});
