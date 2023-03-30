class AccessError extends Error {
  static get TOKEN_NOT_AVAILABLE() {
    return new this('每日免费额度已用完');
  }
}

export default AccessError;
