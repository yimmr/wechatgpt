import { app } from '../../config/index.js';
import RechargeError from '../errors/RechargeError.js';
import Recharge from '../models/Recharge.js';
import { assignTokens } from './user.js';

async function rechargeWallet(openid, cardNumber) {
  const card = await Recharge.findOne({ cardNumber });

  if (card && card.status === 'success') {
    throw RechargeError.INVALID_CARD_NUMBER;
  }

  let cardobj;

  for (const item of app.rechargeCards) {
    if (item.list.includes(cardNumber)) {
      cardobj = item;
      break;
    }
  }

  if (cardobj == null || cardobj.value < 0) {
    throw RechargeError.INVALID_CARD_NUMBER;
  }

  const tokens = cardobj.value / app.tokenRate;

  try {
    const haveTokens = await assignTokens(openid, tokens);
    await Recharge.create({
      cardNumber,
      value: cardobj.value,
      status: 'success',
      openid,
      receivedTokens: tokens,
    });

    return `充值成功，余额: ${(haveTokens * app.tokenRate).toFixed(2)}`;
  } catch (error) {
    console.log(error);
    throw RechargeError.UNABLE_TO_RECHARGE;
  }
}

async function rechargeWalletWithMessage(message) {
  /** @type {String} */
  const content = message.Content;
  let cardNumber;

  if (typeof content === 'string' && content.startsWith(app.rechargeText)) {
    cardNumber = content.substring(app.rechargeText.length).trim().match(/^\w+$/);
  }

  if (!cardNumber) {
    return false;
  }

  try {
    return await rechargeWallet(message.FromUserName, cardNumber[0]);
  } catch (error) {
    if (error instanceof RechargeError) {
      return error.message;
    }

    throw error;
  }
}

export { rechargeWalletWithMessage, rechargeWallet };
