import { Builder } from 'xml2js';

function handleWithTimeout(handle, timeout) {
  return Promise.race([
    handle(),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('timeout')), timeout);
    }),
  ]);
}

function buildXML(rootObj) {
  const builder = new Builder({
    rootName: 'xml',
    cdata: true,
    headless: true,
  });

  return builder.buildObject(rootObj);
}

function waitingForTimeout(timeout, value = undefined) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, timeout);
  });
}

/**
 * 判断是否是N天前的日期
 * @param {String} date
 * @param {Number} n
 */
function isPastDays(date, n) {
  const today = new Date();
  const lastDate = new Date(date);
  const timeDiff = today.getTime() - lastDate.getTime();
  const timeDay = 24 * 60 * 60 * 1000;

  if (timeDiff > timeDay) {
    return Math.floor(timeDiff / timeDay) >= n;
  }

  return today.getDate() > lastDate.getDate();
}

export { handleWithTimeout, buildXML, waitingForTimeout, isPastDays };
