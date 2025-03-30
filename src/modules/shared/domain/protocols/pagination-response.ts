/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
export class PaginationMetadata {
  public pagesCount: number;
  public prevPage: number;
  public nextPage: number;
  public nextPageUrl: string;
  public prevPageUrl: string;

  public constructor(
    public total: number,
    public limit: number,
    public page: number,
    public filters: object
  ) {
    const pagesCount = Math.ceil(total / limit);
    this.prevPage = page <= 1 ? 1 : page - 1;
    this.nextPage = page >= pagesCount ? pagesCount : page + 1;
    this.nextPageUrl = this.getSearchParams(this.prevPage);
    this.prevPageUrl = this.getSearchParams(this.nextPage);
    this.pagesCount = pagesCount;
    this.filters = filters;
  }

  private getSearchParams(page: number) {
    const filters = { ...this.filters, page };
    const searchParams = new URLSearchParams(
      Object.entries(filters).reduce(
        (accumulator: any, [filterName, filterValue]: [string, unknown]) => {
          if (filterValue) accumulator[filterName] = filterValue;
          return accumulator;
        },
        {}
      )
    );

    return `/?${searchParams.toString()}`;
  }
}

export class PaginatedResponse<D> {
  metadata: PaginationMetadata;

  public constructor(
    public records: D[],
    total: number,
    limit: number,
    page: number,
    filters?: object
  ) {
    this.metadata = new PaginationMetadata(total, limit, page, filters ?? {});
  }
}
