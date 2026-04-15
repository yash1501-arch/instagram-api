const axios = require('axios');
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseCount = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Math.floor(val);
  const s = val.toString().trim().replace(/,/g, '');
  let n = parseFloat(s);
  if (/K/i.test(s)) n *= 1000;
  if (/M/i.test(s)) n *= 1000000;
  if (/B/i.test(s)) n *= 1000000000;
  return isNaN(n) ? 0 : Math.floor(n);
};

const randomDelay = (min = 600, max = 1600) =>
  new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const IG_APP_ID = '936619743392459';

// Build cookie string from env vars (if available)
const getSessionCookies = () => {
  const sessionid = process.env.IG_SESSIONID;
  const csrftoken = process.env.IG_CSRFTOKEN;
  const ds_user_id = process.env.IG_DS_USER_ID;

  if (!sessionid) return null;

  let cookie = `sessionid=${sessionid};`;
  if (csrftoken) cookie += ` csrftoken=${csrftoken};`;
  if (ds_user_id) cookie += ` ds_user_id=${ds_user_id};`;
  return cookie;
};

const hasCookies = () => !!process.env.IG_SESSIONID;

// Map raw post edges to normalized objects
const mapEdges = (edges = []) =>
  edges.map((e) => {
    const node = e.node || e;
    return {
      shortcode: node.shortcode || node.code || '',
      likes:
        parseCount(node.edge_media_preview_like?.count) ||
        parseCount(node.like_count) ||
        0,
      comments:
        parseCount(node.edge_media_to_comment?.count) ||
        parseCount(node.comment_count) ||
        0,
      thumbnailUrl:
        node.thumbnail_src ||
        node.display_url ||
        node.image_versions2?.candidates?.[0]?.url ||
        '',
      timestamp: new Date((node.taken_at_timestamp || node.taken_at || 0) * 1000),
      caption:
        node.edge_media_to_caption?.edges?.[0]?.node?.text ||
        node.caption?.text ||
        '',
    };
  });

// ─── Strategy A: Instagram web_profile_info API (Axios + optional cookies) ───

const strategyAxiosWebProfileInfo = async (username) => {
  try {
    logger.info(`[Scraper] Strategy A: web_profile_info API for @${username}`);

    const cookieStr = getSessionCookies();
    const headers = {
      'User-Agent': DESKTOP_UA,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-IG-App-ID': IG_APP_ID,
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': `https://www.instagram.com/${username}/`,
      'Origin': 'https://www.instagram.com',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
    };

    if (cookieStr) {
      headers['Cookie'] = cookieStr;
      if (process.env.IG_CSRFTOKEN) {
        headers['X-CSRFToken'] = process.env.IG_CSRFTOKEN;
      }
      logger.info('[Scraper] Strategy A: using session cookies ✓');
    }

    const resp = await axios.get(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      { headers, timeout: 12000 }
    );

    const user = resp.data?.data?.user;
    if (!user || !user.username) throw new Error('No user object in response');

    const edges =
      user.edge_owner_to_timeline_media?.edges ||
      user.media?.edges ||
      [];

    logger.info(`[Scraper] Strategy A success — posts found: ${edges.length}`);

    return {
      username: user.username,
      fullName: user.full_name || '',
      bio: user.biography || '',
      profilePicture: user.profile_pic_url_hd || user.profile_pic_url || '',
      followersCount: parseCount(user.edge_followed_by?.count ?? user.follower_count),
      followingCount: parseCount(user.edge_follow?.count ?? user.following_count),
      postsCount: parseCount(user.edge_owner_to_timeline_media?.count ?? user.media_count),
      isVerified: user.is_verified || false,
      recentPosts: mapEdges(edges),
      source: 'web_profile_info_api',
    };
  } catch (err) {
    logger.warn(`[Scraper] Strategy A failed: ${err.message}`);
    return null;
  }
};

// ─── Strategy B: Puppeteer with session cookies injected into browser ─────────

const strategyPuppeteerWithCookies = async (username) => {
  let browser;
  try {
    logger.info(`[Scraper] Strategy B: Puppeteer${hasCookies() ? ' (with session cookies)' : ' (no cookies)'} for @${username}`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1280,820',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(DESKTOP_UA);
    await page.setViewport({ width: 1280, height: 820 });
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    // Inject cookies if available
    if (hasCookies()) {
      const cookies = [
        { name: 'sessionid', value: process.env.IG_SESSIONID, domain: '.instagram.com', path: '/' },
        { name: 'csrftoken', value: process.env.IG_CSRFTOKEN || '', domain: '.instagram.com', path: '/' },
        { name: 'ds_user_id', value: process.env.IG_DS_USER_ID || '', domain: '.instagram.com', path: '/' },
      ].filter((c) => c.value);
      await page.setCookie(...cookies);
      logger.info('[Scraper] Strategy B: session cookies injected into Puppeteer ✓');
    }

    // Intercept XHR/fetch responses to capture profile + post data
    let capturedUser = null;

    page.on('response', async (response) => {
      if (capturedUser) return;
      const url = response.url();
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('application/json')) return;
      if (
        !url.includes('web_profile_info') &&
        !url.includes('graphql') &&
        !url.includes('__a=1')
      ) return;

      try {
        const json = await response.json();
        const user = json?.data?.user || json?.graphql?.user || null;
        if (user?.username) {
          capturedUser = user;
          logger.info(`[Scraper] Strategy B: intercepted API response — posts: ${
            user.edge_owner_to_timeline_media?.edges?.length || 0
          }`);
        }
      } catch (_) {}
    });

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Scroll to trigger lazy-loading of the post grid
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 600));
      await randomDelay(800, 1400);
    }

    // Fallback: parse __NEXT_DATA__ from page if XHR wasn't intercepted
    if (!capturedUser) {
      capturedUser = await page.evaluate(() => {
        try {
          const el = document.getElementById('__NEXT_DATA__');
          if (!el) return null;
          const d = JSON.parse(el.textContent);
          return (
            d?.props?.pageProps?.data?.user ||
            d?.props?.pageProps?.user ||
            null
          );
        } catch (_) {
          return null;
        }
      });
    }

    if (!capturedUser) throw new Error('Could not capture user object from any source');

    const edges =
      capturedUser.edge_owner_to_timeline_media?.edges ||
      capturedUser.media?.edges ||
      [];

    // If still no posts but we can see post thumbnails in the DOM, grab their shortcodes
    let recentPosts = mapEdges(edges);

    if (recentPosts.length === 0 && hasCookies()) {
      logger.info('[Scraper] Strategy B: no posts in API response — scraping post grid from DOM');
      const postLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href*="/p/"]'))
          .map((a) => a.getAttribute('href'))
          .filter((h) => /^\/p\/[\w-]+\/$/.test(h))
          .slice(0, 12)
      );
      logger.info(`[Scraper] Strategy B: found ${postLinks.length} post links in DOM`);

      // Scrape individual posts via embed pages
      for (const link of postLinks.slice(0, 9)) {
        try {
          const shortcode = link.split('/')[2];
          await page.goto(
            `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
            { waitUntil: 'domcontentloaded', timeout: 10000 }
          );
          await randomDelay(500, 900);

          const postData = await page.evaluate((sc) => {
            const bodyText = document.body.innerText || '';
            const likesMatch = bodyText.match(/([\d,]+)\s+like/i);
            const commentsMatch = bodyText.match(/([\d,]+)\s+comment/i);
            const imgEl = document.querySelector('img');
            const captionEl = document.querySelector('.Caption, [class*="caption"], [class*="Caption"]');
            return {
              shortcode: sc,
              likes: likesMatch ? parseInt(likesMatch[1].replace(/,/g, '')) : 0,
              comments: commentsMatch ? parseInt(commentsMatch[1].replace(/,/g, '')) : 0,
              thumbnailUrl: imgEl ? imgEl.src : '',
              caption: captionEl ? captionEl.innerText.trim().substring(0, 600) : '',
              timestamp: Date.now(),
            };
          }, shortcode);

          recentPosts.push({ ...postData, timestamp: new Date(postData.timestamp) });
        } catch (_) {}
      }
    }

    logger.info(`[Scraper] Strategy B success — posts: ${recentPosts.length}`);

    return {
      username: capturedUser.username,
      fullName: capturedUser.full_name || '',
      bio: capturedUser.biography || '',
      profilePicture:
        capturedUser.profile_pic_url_hd || capturedUser.profile_pic_url || '',
      followersCount: parseCount(capturedUser.edge_followed_by?.count ?? capturedUser.follower_count),
      followingCount: parseCount(capturedUser.edge_follow?.count ?? capturedUser.following_count),
      postsCount: parseCount(capturedUser.edge_owner_to_timeline_media?.count ?? capturedUser.media_count),
      isVerified: capturedUser.is_verified || false,
      recentPosts,
      source: hasCookies() ? 'puppeteer_with_cookies' : 'puppeteer_no_cookies',
    };
  } catch (err) {
    logger.warn(`[Scraper] Strategy B failed: ${err.message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

// ─── Main Entry Point ─────────────────────────────────────────────────────────

const scrapeInstagramProfile = async (username) => {
  if (!hasCookies()) {
    logger.warn(
      '[Scraper] ⚠️  No IG_SESSIONID in .env — post likes/comments may be unavailable. ' +
      'Add your Instagram session cookies to .env to unlock full data.'
    );
  }

  // Strategy A: Fast Axios call to IG internal API
  const resultA = await strategyAxiosWebProfileInfo(username);
  if (resultA && resultA.followersCount > 0 && resultA.recentPosts.length > 0) {
    logger.info(`[Scraper] ✅ Done via Strategy A | Posts: ${resultA.recentPosts.length}`);
    return resultA;
  }

  // Strategy B: Puppeteer with cookie injection + DOM scraping fallback
  const resultB = await strategyPuppeteerWithCookies(username);

  // Pick whichever result is richer
  const best = (() => {
    if (!resultA && !resultB) return null;
    if (!resultA) return resultB;
    if (!resultB) return resultA;
    // Prefer the one with more posts; fall back to follower count
    if (resultB.recentPosts.length > resultA.recentPosts.length) return resultB;
    if (resultA.recentPosts.length > 0) return resultA;
    return resultB.followersCount > 0 ? resultB : resultA;
  })();

  if (!best || best.followersCount === 0) {
    throw new Error(
      `Failed to scrape @${username}. ` +
      'Profile may be private, or Instagram is blocking requests. ' +
      'Add IG_SESSIONID to .env for reliable scraping.'
    );
  }

  logger.info(
    `[Scraper] ✅ Done via ${best.source} | ` +
    `Followers: ${best.followersCount} | Posts: ${best.recentPosts.length}`
  );
  return best;
};

module.exports = { scrapeInstagramProfile };
