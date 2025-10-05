export interface BaseRepositoryFindManyFilters {
  search?: string;
  offset?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface BaseRepositoryFindManyResult<Model> {
  count: number;
  records: Model[];
}
