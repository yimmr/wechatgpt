import AccessError from '../errors/AccessError.js';
import { chatWithGPT, chatWithGPTLimit } from '../openai/index.js';

const tasks = new Map();

export default async function handleText({ Content, FromUserName }) {
  let res;

  // 如果缓存有同问题的任务，先从缓存获取
  if (tasks.has(Content)) {
    console.log(`有在提问中：${Content}`);
    res = await tasks.get(Content);
    tasks.delete(Content);
    console.log(`提问完成：${Content} ${res ? 1 : 0}`);
  }

  // 无论是否有缓存，只要没有得到结果就请求AI
  if (!res) {
    const task = chatWithGPT(Content, FromUserName);
    tasks.set(Content, task);
    res = await task;
    tasks.delete(Content);
  }

  return res ? res.choices[0].message.content.trim() : '';
}
