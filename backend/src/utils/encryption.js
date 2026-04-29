// End-to-End Encryption Utilities
// Using Web Crypto API for client-side encryption
// Server only stores encrypted data

const crypto = require('crypto');

// Generate key pair for user
const generateKeyPair = async () => {
  try {
    const { publicKey, privateKey } = await crypto.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKeyPem = await crypto.exportKey('spki', publicKey);
    const privateKeyPem = await crypto.exportKey('pkcs8', privateKey);

    return {
      publicKey: Buffer.from(publicKeyPem).toString('base64'),
      privateKey: Buffer.from(privateKeyPem).toString('base64'),
    };
  } catch (error) {
    throw new Error('Failed to generate key pair: ' + error.message);
  }
};

// Generate shared group key
const generateGroupKey = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Encrypt message with public key (for direct messages)
const encryptMessage = async (message, publicKeyPem) => {
  try {
    const publicKey = await crypto.importKey(
      'spki',
      Buffer.from(publicKeyPem, 'base64'),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      Buffer.from(message, 'utf8')
    );

    return Buffer.from(encrypted).toString('base64');
  } catch (error) {
    throw new Error('Failed to encrypt message: ' + error.message);
  }
};

// Decrypt message with private key (client-side only)
const decryptMessage = async (encryptedMessage, privateKeyPem) => {
  try {
    const privateKey = await crypto.importKey(
      'pkcs8',
      Buffer.from(privateKeyPem, 'base64'),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      Buffer.from(encryptedMessage, 'base64')
    );

    return Buffer.from(decrypted).toString('utf8');
  } catch (error) {
    throw new Error('Failed to decrypt message: ' + error.message);
  }
};

// Encrypt with symmetric key (for group messages)
const encryptWithSymmetricKey = (message, key) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', Buffer.from(key, 'base64'));
    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
  } catch (error) {
    throw new Error('Failed to encrypt with symmetric key: ' + error.message);
  }
};

// Decrypt with symmetric key (for group messages)
const decryptWithSymmetricKey = (encryptedMessage, key) => {
  try {
    const [ivHex, encrypted] = encryptedMessage.split(':');
    const iv = Buffer.from(ivHex, 'base64');
    const decipher = crypto.createDecipher('aes-256-cbc', Buffer.from(key, 'base64'));
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt with symmetric key: ' + error.message);
  }
};

// Hash for message integrity
const hashMessage = (message) => {
  return crypto.createHash('sha256').update(message).digest('base64');
};

// Verify message integrity
const verifyMessageIntegrity = (message, hash) => {
  const computedHash = hashMessage(message);
  return computedHash === hash;
};

module.exports = {
  generateKeyPair,
  generateGroupKey,
  encryptMessage,
  decryptMessage,
  encryptWithSymmetricKey,
  decryptWithSymmetricKey,
  hashMessage,
  verifyMessageIntegrity,
};