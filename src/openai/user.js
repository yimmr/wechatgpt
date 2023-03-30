import User from '../models/User.js';

async function getUserOrCreate(openid) {
  let user = await User.findOne({ openid });

  if (!user) {
    return await User.create({ openid });
  }

  return user;
}

// 先用免费额度抵消，不够再消费正常额度。那么只有正常额度可能会欠费，充值或赠送从正常额度扣即可
async function updateUserUsage(openid, usedTokens) {
  const user = await getUserOrCreate(openid);

  if (!usedTokens) return user;

  let freeTokens = user.freeTokens - usedTokens;

  if (freeTokens < 0) {
    user.tokens += freeTokens;
    user.freeTokens = 0;
  } else {
    user.freeTokens = freeTokens;
  }

  await user.save();

  return user;
}

async function assignTokens(openid, tokens) {
  const user = await getUserOrCreate(openid);

  user.tokens += tokens;

  await user.save();

  return user.tokens;
}

/**
 * 假如下次使用时有送免费令牌，可抵消欠费
 * 一直未使用一直处于欠费状态，只要免费送令牌活动一直在就有机会抵消欠费
 * @param {String} openid
 * @param {Number} freeTokens
 */
async function assignFreeTokens(openid, freeTokens) {
  const user = typeof openid === 'string' ? await getUserOrCreate(openid) : openid;

  // 假如欠费或再扣除免费额度
  if (user.tokens < 0 || freeTokens < 0) {
    const diff = freeTokens + user.tokens;
    // 如果免费额度可抵消欠费，则正常额度为0，免费额度为差值
    // 如果不可抵消欠费，则正常为差值，免费额度为0
    user.tokens = Math.min(0, diff);
    user.freeTokens = Math.max(0, diff);
  } else {
    user.freeTokens = freeTokens;
  }

  user.freeTokensUpdateAt = new Date().getTime();

  await user.save();
}

export { getUserOrCreate, updateUserUsage, assignFreeTokens, assignTokens };
