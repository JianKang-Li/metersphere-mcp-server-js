import { createCipheriv, randomUUID } from 'node:crypto';

/**
 * AES/CBC/PKCS5Padding 签名生成
 * 与 Java 版 CodingUtils.java 算法完全一致
 *
 * 明文格式: accessKey|UUID|timestamp
 * 密钥: secretKey
 * IV: accessKey（取前 16 字节）
 * 输出: Base64 编码的密文
 */

/**
 * AES 加密
 * @param {string} plaintext - 明文
 * @param {string} secretKey - 密钥
 * @param {string} iv - 初始化向量
 * @returns {string} Base64 编码的密文
 */
function aesEncrypt(plaintext, secretKey, iv) {
  const key = Buffer.from(secretKey, 'utf-8');
  // Java 版 IvParameterSpec 接收 byte[]，AES 块大小 16 字节
  // 不足 16 字节时 Java Cipher 会自动零填充，Node.js 需手动处理
  const ivBytes = Buffer.from(iv, 'utf-8');
  const ivBuf = Buffer.alloc(16);
  ivBytes.copy(ivBuf, 0, 0, Math.min(ivBytes.length, 16));
  // Java 的 AES/CBC/PKCS5Padding 对应 Node.js 的 aes-128-cbc（PKCS7 兼容 PKCS5）
  const cipher = createCipheriv('aes-128-cbc', key, ivBuf);
  let encrypted = cipher.update(plaintext, 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('base64');
}

/**
 * 生成 MeterSphere 鉴权签名
 * @param {string} accessKey - 访问密钥
 * @param {string} secretKey - 签名密钥
 * @returns {string} Base64 编码的签名
 */
export function generateSignature(accessKey, secretKey) {
  const plaintext = `${accessKey}|${randomUUID()}|${Date.now()}`;
  return aesEncrypt(plaintext, secretKey, accessKey);
}
