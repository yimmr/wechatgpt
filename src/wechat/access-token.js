import axios from 'axios';
import { wechat as config } from '../../config';
import { adminCache } from '../data/cache';

async function getAccessToken() {
  const cacheKey = 'wechat_access_token';
  const cache = await adminCache();
  let accessToken = await cache.get(cacheKey);

  if (accessToken) {
    return accessToken;
  }

  try {
    const { WECHAT_APP_ID, WECHAT_APP_SECRET } = process.env;
    const { accessTokenTTL, apiDomain } = config;
    const res = (
      await axios.get(
        `https://${apiDomain}/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}`
      )
    ).data;

    if (res.access_token) {
      accessToken = res.access_token;
      await cache.set(cacheKey, accessToken, accessTokenTTL);
      return accessToken;
    } else {
      throw new Error(`Failed to fetch access_token: ${JSON.stringify(res)}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch access_token');
  }
}

export default getAccessToken;
