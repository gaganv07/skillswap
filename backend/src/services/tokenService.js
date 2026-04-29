const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/appError');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const createAccessToken = (userId) =>
  jwt.sign({ id: userId, type: 'access', tokenId: crypto.randomUUID() }, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

const createRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: 'refresh', tokenId: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

const decodeRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

const getRefreshTokenExpiry = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
};

const issueAuthTokens = async (user) => {
  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());

  user.refreshTokens = (user.refreshTokens || []).filter(
    (entry) => entry.expiresAt > new Date()
  );
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(refreshToken),
  });
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const rotateRefreshToken = async (user, refreshToken) => {
  const decoded = decodeRefreshToken(refreshToken);

  if (decoded.type !== 'refresh' || decoded.id !== user._id.toString()) {
    throw new AppError('Invalid refresh token', 401);
  }

  const hashedToken = hashToken(refreshToken);
  const tokenExists = (user.refreshTokens || []).some(
    (entry) => entry.tokenHash === hashedToken && entry.expiresAt > new Date()
  );

  if (!tokenExists) {
    throw new AppError('Refresh token expired or revoked', 401);
  }

  user.refreshTokens = user.refreshTokens.filter(
    (entry) => entry.tokenHash !== hashedToken && entry.expiresAt > new Date()
  );
  await user.save({ validateBeforeSave: false });

  return issueAuthTokens(user);
};

const revokeRefreshToken = async (user, refreshToken) => {
  const hashedToken = hashToken(refreshToken);
  user.refreshTokens = (user.refreshTokens || []).filter(
    (entry) => entry.tokenHash !== hashedToken
  );
  await user.save({ validateBeforeSave: false });
};

module.exports = {
  hashToken,
  issueAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
};
