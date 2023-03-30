import EventEmitter from 'events';

import { buildXML, waitingForTimeout } from '../helper.js';
import { wechat } from '../../config/index.js';
import reply from '../../config/reply.js';
import createMessageHandler from './create-message-handler.js';

const { messageRequestTimeout, messageRequestRetries, replyCacheMode, replyCacheTTL } = wechat;

const items = new Map();
const tasks = new Map();
// const msgmap = new Map();
const emitter = new EventEmitter();

export default async function passiveReplyMessage(message) {
  const key =
    message.MsgType !== 'event' ? message.MsgId : message.FromUserName + message.CreateTime;
  let status;

  // 判断任务是否已存在
  if (tasks.has(key)) {
    status = items.get(key);
    status.retries += 1;
    emitter.emit('updateCount', key);
  } else {
    const [_status, handleMessage] = createMessageHandler({
      retries: 1,
      cacheTTL: replyCacheMode === 'timeout' || replyCacheMode === 'always' ? replyCacheTTL : 0,
    });
    status = _status;

    if (replyCacheMode === 'timeout') {
      status.cacheTTL = 0;
    }

    const task = async () => {
      const value = await handleMessage(message);

      // 任务完成后进行清理
      // msgmap.delete(message.Content);
      items.delete(key);
      tasks.delete(key);

      return value;
    };

    // 如果有同一条消息在处理，则不重复请求接口(注：存在问题暂不实现)
    // const sameKey = msgmap.get(message.Content);

    // if (sameKey) {
    //   tasks.set(key, tasks.get(sameKey));
    // } else {
    tasks.set(key, task());
    //   msgmap.set(message.Content, key);
    // }
  }

  items.set(key, status);

  const list = [tasks.get(key)];
  const { retries } = status;

  // 限制最后一次重试的响应时间
  if (retries >= messageRequestRetries) {
    list.push(
      (async () => {
        await waitingForTimeout(messageRequestTimeout);

        if (replyCacheMode === 'timeout') {
          status.cacheTTL = replyCacheTTL;
        }

        return reply.timeoutText;
      })()
    );
  } else {
    // 结束旧的重复的请求
    list.push(
      new Promise((resolve) =>
        emitter.on('updateCount', (currentKey) => {
          currentKey === key && resolve();
        })
      )
    );
  }

  console.log(`waiting: ${retries} ${message.Content} ${[...tasks.keys()]}`);

  return buildResponse(await Promise.race(list), message);
}

function buildResponse(value, context) {
  if (value == null) return;

  return {
    contentType: value ? 'application/xml' : 'text/plain',
    content: value ? buildXML(buildReply(value, context)) : '',
  };
}

function buildReply(value, { FromUserName, ToUserName }) {
  return {
    ToUserName: FromUserName,
    FromUserName: ToUserName,
    CreateTime: Date.now(),
    MsgType: Array.isArray(value) ? value[1] : 'text',
    Content: Array.isArray(value) ? value[0] : value,
  };
}
