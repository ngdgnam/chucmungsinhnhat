const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const CACHE_DIR = path.join(__dirname, '..', 'data', 'Cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

async function loadImageFromUrl(url) {
  try {
    const image = await Jimp.read(url);
    return image;
  } catch (err) {
    return null;
  }
}

async function createWelcomeImage({ api, uid, name = 'Thành viên mới', groupName = 'Nhóm' }) {
  try {
    const timestamp = Date.now();
    const outPath = path.join(CACHE_DIR, `welcome_${uid}_${timestamp}.png`);

    const bg = new Jimp(900, 360, 0xffffffff);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // try fetch avatar
    let avatar = null;
    try {
      const info = await api.getUserInfo(uid);
      const profile = info?.changed_profiles?.[uid] || info?.[uid] || {};
      const avatarUrl = (profile.avatar && profile.avatar.uri) || profile.avatarUri || profile.avatarUrl || profile.imageUrl || null;
      if (avatarUrl) avatar = await loadImageFromUrl(avatarUrl);
    } catch {}

    if (avatar) {
      avatar = avatar.resize(260, 260);
      bg.composite(avatar, 30, 50);
    }

    const textX = avatar ? 320 : 30;
    const title = `Chào mừng ${name}`;
    const sub = `đến ${groupName}`;

    bg.print(font, textX, 80, title);
    bg.print(font, textX, 140, sub);

    await bg.quality(80).writeAsync(outPath);

    return outPath;
  } catch (err) {
    return null;
  }
}

async function createLeaveImage({ api, uid, name = 'Thành viên', groupName = 'Nhóm' }) {
  try {
    const timestamp = Date.now();
    const outPath = path.join(CACHE_DIR, `bye_${uid}_${timestamp}.png`);

    const bg = new Jimp(900, 360, 0xffffffff);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    let avatar = null;
    try {
      const info = await api.getUserInfo(uid);
      const profile = info?.changed_profiles?.[uid] || info?.[uid] || {};
      const avatarUrl = (profile.avatar && profile.avatar.uri) || profile.avatarUri || profile.avatarUrl || profile.imageUrl || null;
      if (avatarUrl) avatar = await loadImageFromUrl(avatarUrl);
    } catch {}

    if (avatar) {
      avatar = avatar.resize(260, 260);
      bg.composite(avatar, 30, 50);
    }

    const textX = avatar ? 320 : 30;
    const title = `Tạm biệt ${name}`;
    const sub = `Rời ${groupName}`;

    bg.print(font, textX, 80, title);
    bg.print(font, textX, 140, sub);

    await bg.quality(80).writeAsync(outPath);

    return outPath;
  } catch (err) {
    return null;
  }
}

module.exports = { createWelcomeImage, createLeaveImage };
