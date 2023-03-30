import { wechat as config } from '../../config/index.js';
import reply from '../../config/reply.js';
import { wechatMessageCache } from '../data/cache.js';
import AccessError from '../errors/AccessError.js';
import { rechargeWalletWithMessage } from '../openai/recharge-wallet.js';
import handleText from './handle-text.js';

const getReplyContent = async (message) => {
  switch (message.MsgType) {
    case 'text':
      return await handleText(message);
    case 'image':
    case 'voice':
    case 'video':
    case 'shortvideo':
    case 'location':
    case 'link':
      return reply.unsupportedType;
    case 'event':
      const { Event, EventKey } = message;

      if (Event === 'subscribe') {
        // 处理关注事件
        return reply.subscribe;
      } else if (Event === 'unsubscribe') {
      } else if (Event === 'CLICK') {
        // 处理自定义菜单点击事件
        if (EventKey === 'menu_key') {
          return '';
        }
      }
      break;
    default:
      return reply.unknownType;
  }
};

const getReplyContentWithCache = async (message, status) => {
  const cache = await wechatMessageCache();
  const key = status.cacheKey || message.Content;

  console.log(`读取缓存：${key}`);
  let content = await cache.get(key);

  if (content) {
    return content;
  }

  console.log(`获取原内容：${key}`);
  content = await getReplyContent(message);
  console.log(`原内容OK：${key}`);
  let ttl = status.cacheTTL;

  // 决定是否缓存
  if (content && ttl) {
    console.log(`原内容缓存：${key}`);
    await cache.set(key, content, ttl);
  }

  return content;
};

/**
 * @param {String} str
 * @param {Number} length
 * @param {String} tips
 */
function* replyContentIterator(str, length, tips = '') {
  let _tips = length <= tips.length ? '' : tips;
  let max = length - _tips.length;

  for (let index = 0; index < str.length; index += max) {
    let endx = index + max;
    yield str.substring(index, endx) + (endx >= str.length ? '' : _tips);
  }
}

const iterators = new Map();

const getReplyWithLimit = async (message, status) => {
  const openid = message.FromUserName;

  if (message.Content === config.nextContentIdentifier && iterators.has(openid)) {
    const replyObj = iterators.get(openid);

    if (replyObj.iterator) {
      const reply = replyObj.iterator.next();

      if (reply.done) {
        clearTimeout(replyObj.timer);
        iterators.delete(openid);
      } else {
        return reply.value;
      }
    }
  }

  const reply = await (status.cacheEnabled
    ? getReplyContentWithCache(message, status)
    : getReplyContent(message));

  if (reply.length > config.maxContentLength) {
    const iterator = replyContentIterator(
      reply,
      config.maxContentLength,
      '\n' + config.nextContentTips
    );

    // 假如用户不回复继续指令而回复相同问题，此时能重置迭代器
    iterators.set(openid, {
      iterator,
      timer: setTimeout(() => {
        iterators.delete(openid);
      }, Math.min(config.replyCacheTTL, 60 * 10) * 1000),
    });

    return iterator.next().value;
  }

  if (iterators.has(openid)) {
    clearTimeout(iterators.get(openid)?.timer);
    iterators.delete(openid);
  }

  return reply;
};

export default function createMessageHandler(customState = {}) {
  const status = {
    cacheTTL: 0,
    ...customState,
  };

  status['cacheEnabled'] = status.cacheTTL;

  const getReply = async (message) => {
    // console.log(message);
    try {
      const reply = await rechargeWalletWithMessage(message);

      if (reply !== false) return reply;

      return await getReplyWithLimit(message, status);
    } catch (error) {
      if (error instanceof AccessError) {
        return error.message;
      }

      console.log(error);
    }
  };

  return [status, getReply];
}
