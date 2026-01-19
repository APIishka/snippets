class OldApi {
  getData() {
    return { value: 'data', timestamp: Date.now() };
  }
}

class NewApiAdapter {
  constructor(oldApi) {
    this.oldApi = oldApi;
  }

  fetchData() {
    const result = this.oldApi.getData();
    return {
      data: result.value,
      date: new Date(result.timestamp).toISOString()
    };
  }
}

const oldApi = new OldApi();
const adapter = new NewApiAdapter(oldApi);

const data = adapter.fetchData();
console.log(data);
