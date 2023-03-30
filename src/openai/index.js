import EventEmitter from 'events';

import { Configuration, OpenAIApi } from 'openai';
import { openai as config } from '../../config/index.js';
import { waitingForTimeout } from '../helper.js';
import checkOpenaiAccess from './check-openai-access.js';
import { updateUserUsage } from './user.js';

async function chatWithGPT(message, userid) {
  await checkOpenaiAccess(userid);

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY || config.api_key,
  });

  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message + '' }],
  });

  const { usage } = completion.data;

  console.log(`扣费`, userid, message);

  await updateUserUsage(userid, usage?.total_tokens || 0);

  return completion.data;
}

let requests = 0;
const emitter = new EventEmitter();
async function chatWithGPTLimit(message, userid) {
  await new Promise((resolve, reject) => {
    console.log('等待中', requests);
    if (requests < config.limitRequests) resolve();
    emitter.on('enqueueUpdate', () => {
      if (requests < config.limitRequests) {
        requests += 1;
        resolve();
      }
    });
  });
  console.log('开始处理', requests);

  if (config.requestTimeout) {
    await waitingForTimeout(config.requestTimeout);
  }

  const value = await chatWithGPT(message, userid);

  requests -= 1;

  emitter.emit('enqueueUpdate');

  return value;
}

export { chatWithGPT, chatWithGPTLimit };
