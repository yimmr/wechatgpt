import { app } from '../../config/index.js';
import AccessError from '../errors/AccessError.js';
import { isPastDays } from '../helper.js';
import { assignFreeTokens, getUserOrCreate } from './user.js';

async function checkOpenaiAccess(userName) {
  const user = await getUserOrCreate(userName);

  // 今天是否更新过数值
  if (!user.freeTokensUpdateAt || isPastDays(user.freeTokensUpdateAt, app.freeTokensEveryDays)) {
    await assignFreeTokens(user, app.freeTokens);
  }

  if (user.freeTokens > 0) {
    return true;
  }

  if (user.tokens > 0) {
    return true;
  }

  throw AccessError.TOKEN_NOT_AVAILABLE;
}

export default checkOpenaiAccess;
