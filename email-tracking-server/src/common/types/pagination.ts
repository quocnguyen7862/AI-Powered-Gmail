export type Pagination<E> = {
  page?: number;
  nextPage?: number;
  total: number;
  data: E[];
};
