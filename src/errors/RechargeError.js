class RechargeError extends Error {
  static get INVALID_CARD_NUMBER() {
    return new this('卡号无效');
  }

  static get UNABLE_TO_RECHARGE() {
    return new this('系统无法充值');
  }
}

export default RechargeError;
