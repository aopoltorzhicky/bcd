const axios = require('axios').default;

export function createAxios(baseURL, timeout = 10000) {
    if (!baseURL) return null;
    return axios.create({
      baseURL: baseURL,
      timeout: timeout,
      responseType: 'json'
    })
  }
  