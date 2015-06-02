var defaultURL = 'http://localhost:4444/api';

module.exports = {
  baseURL : typeof window === 'undefined' ? defaultURL : '/api'
}
