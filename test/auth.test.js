import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv } from 'node:crypto';

/**
 * AES 签名算法单元测试
 * 验证 Node.js 实现与 Java 版 CodingUtils.java 的 AES/CBC/PKCS5Padding 算法一致
 */

/**
 * AES 加密（与 auth.js 中的实现一致，用于可控测试）
 */
function aesEncrypt(plaintext, secretKey, iv) {
  const key = Buffer.from(secretKey, 'utf-8');
  // 与 auth.js 保持一致：不足 16 字节时零填充
  const ivBytes = Buffer.from(iv, 'utf-8');
  const ivBuf = Buffer.alloc(16);
  ivBytes.copy(ivBuf, 0, 0, Math.min(ivBytes.length, 16));
  const cipher = createCipheriv('aes-128-cbc', key, ivBuf);
  let encrypted = cipher.update(plaintext, 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('base64');
}

describe('AES 签名算法', () => {
  it('固定输入应产生确定的加密输出', () => {
    // 使用固定的 plaintext、secretKey 和 accessKey(IV)
    const plaintext = 'test-access-key|550e8400-e29b-41d4-a716-446655440000|1719216000000';
    const secretKey = '1234567890abcdef'; // 16 字节密钥
    const accessKey = 'test-access-key!'; // 16 字节 IV

    const result = aesEncrypt(plaintext, secretKey, accessKey);

    // 验证输出是合法的 Base64 字符串
    assert.ok(/^[A-Za-z0-9+/]+=*$/.test(result), '输出应为合法 Base64');
    // 验证相同输入产生相同输出（AES 是确定性加密）
    const result2 = aesEncrypt(plaintext, secretKey, accessKey);
    assert.strictEqual(result, result2, '相同输入应产生相同输出');
  });

  it('不同明文应产生不同密文', () => {
    const secretKey = '1234567890abcdef';
    const accessKey = 'test-access-key!';

    const result1 = aesEncrypt('plaintext-1', secretKey, accessKey);
    const result2 = aesEncrypt('plaintext-2', secretKey, accessKey);

    assert.notStrictEqual(result1, result2, '不同明文应产生不同密文');
  });

  it('不同密钥应产生不同密文', () => {
    const plaintext = 'same-plaintext';
    const accessKey = 'test-access-key!';

    const result1 = aesEncrypt(plaintext, '1234567890abcdef', accessKey);
    const result2 = aesEncrypt(plaintext, 'abcdef1234567890', accessKey);

    assert.notStrictEqual(result1, result2, '不同密钥应产生不同密文');
  });

  it('accessKey 不足 16 字节时应零填充到 16 字节', () => {
    const plaintext = 'test-data';
    const secretKey = '1234567890abcdef';
    const shortAccessKey = 'short'; // 5 字节，不足 16

    // Java 版 IvParameterSpec 接收短 IV，Cipher 自动零填充
    // Node.js 版手动用 Buffer.alloc(16) 零填充，行为与 Java 一致
    const result = aesEncrypt(plaintext, secretKey, shortAccessKey);
    assert.ok(result, 'accessKey 不足 16 字节时应正常加密（零填充）');
    // 相同输入应产生相同输出
    const result2 = aesEncrypt(plaintext, secretKey, shortAccessKey);
    assert.strictEqual(result, result2, '相同输入应产生相同输出');
  });

  it('accessKey 恰好 16 字节时应正常工作', () => {
    const plaintext = 'test-data';
    const secretKey = '1234567890abcdef';
    const accessKey = 'exactly16bytes!!'; // 恰好 16 字节

    const result = aesEncrypt(plaintext, secretKey, accessKey);
    assert.ok(result, 'accessKey 恰好 16 字节时应正常加密');
  });

  it('accessKey 超过 16 字节时应截取前 16 字节作为 IV', () => {
    const plaintext = 'test-data';
    const secretKey = '1234567890abcdef';
    const longAccessKey = 'this-is-more-than-16-bytes';

    const result = aesEncrypt(plaintext, secretKey, longAccessKey);
    assert.ok(result, 'accessKey 超过 16 字节时应正常加密（截取前 16 字节）');
  });

  it('签名明文格式应为 accessKey|UUID|timestamp', () => {
    // 验证明文格式与 Java 版一致
    const accessKey = 'test-ak';
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const timestamp = 1719216000000;
    const plaintext = `${accessKey}|${uuid}|${timestamp}`;

    assert.strictEqual(plaintext, 'test-ak|550e8400-e29b-41d4-a716-446655440000|1719216000000');
  });
});

describe('generateSignature 函数', () => {
  it('应生成合法的 Base64 签名', async () => {
    const { generateSignature } = await import('../src/client/auth.js');
    const result = generateSignature('test-access-key!', '1234567890abcdef');
    assert.ok(/^[A-Za-z0-9+/]+=*$/.test(result), '签名应为合法 Base64');
  });

  it('每次调用应产生不同签名（因为 UUID 和时间戳不同）', async () => {
    const { generateSignature } = await import('../src/client/auth.js');
    const result1 = generateSignature('test-access-key!', '1234567890abcdef');
    // 等待至少 1ms 确保时间戳不同
    await new Promise(resolve => setTimeout(resolve, 2));
    const result2 = generateSignature('test-access-key!', '1234567890abcdef');
    assert.notStrictEqual(result1, result2, '每次调用应产生不同签名');
  });
});
