class QueryBuilder {
  constructor() {
    this.query = {};
  }

  select(fields) {
    this.query.select = fields;
    return this;
  }

  from(table) {
    this.query.from = table;
    return this;
  }

  where(condition) {
    this.query.where = condition;
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.query.orderBy = { field, direction };
    return this;
  }

  build() {
    return this.query;
  }
}

const query = new QueryBuilder()
  .select(['id', 'name', 'email'])
  .from('users')
  .where({ active: true })
  .orderBy('name', 'DESC')
  .build();

console.log(query);
