import app from './app.js';

const wechat = {
  path: '/wechat',
  apiDomain: 'api.weixin.qq.com',
  messageRequestRetries: 3,
  messageRequestTimeout: 4500,
  replyCacheMode: 'timeout', // 回复内容的缓存模式：always 总是 | timeout 超时 | 其他值禁用缓存
  replyCacheTTL: 60 * 60 * 2, // 缓存过期时间，单位为秒
  accessTokenTTL: 5400,
  maxContentLength: 600,
  nextContentIdentifier: '继续',
  nextContentTips: '[回复继续获取剩余内容]',
};

const openai = {
  base_url: 'api.chatgpt.com/v1',
  limitRequests: 10,
  requestTimeout: 50,
};

export { wechat, openai, app };
