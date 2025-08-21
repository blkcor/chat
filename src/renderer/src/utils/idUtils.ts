import { v4 as uuidv4, v1 as uuidv1 } from 'uuid'

/**
 * ID生成工具类
 * 统一管理项目中的ID生成逻辑
 */
export class IdGenerator {
  /**
   * 生成标准UUID v4 (随机)
   * 适用于大部分场景
   */
  static uuid(): string {
    return uuidv4()
  }

  /**
   * 生成UUID v1 (基于时间戳)
   * 适用于需要时间排序的场景
   */
  static timeBasedUuid(): string {
    return uuidv1()
  }

  /**
   * 生成短ID (8位)
   * 适用于临时标识或显示用途
   */
  static shortId(): string {
    return uuidv4().substring(0, 8)
  }

  /**
   * 生成对话ID
   * 使用时间戳UUID确保按创建时间排序
   */
  static conversationId(): string {
    return uuidv1()
  }

  /**
   * 生成消息ID
   * 使用时间戳UUID确保消息顺序
   */
  static messageId(): string {
    return uuidv1()
  }

  /**
   * 生成提供商ID
   * 使用标准UUID
   */
  static providerId(): string {
    return uuidv4()
  }

  /**
   * 生成用户会话ID
   * 使用标准UUID
   */
  static sessionId(): string {
    return uuidv4()
  }

  /**
   * 生成带前缀的ID
   * @param prefix 前缀
   * @param useTimeBased 是否使用时间戳UUID
   */
  static withPrefix(prefix: string, useTimeBased: boolean = false): string {
    const id = useTimeBased ? uuidv1() : uuidv4()
    return `${prefix}_${id}`
  }

  /**
   * 验证UUID格式
   * @param id 要验证的ID
   */
  static isValidUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  }

  /**
   * 从UUID提取时间戳 (仅适用于UUID v1)
   * @param uuid UUID v1字符串
   */
  static extractTimestamp(uuid: string): Date | null {
    try {
      // UUID v1的时间戳提取逻辑
      const hex = uuid.replace(/-/g, '')
      const timeLow = parseInt(hex.substring(0, 8), 16)
      const timeMid = parseInt(hex.substring(8, 12), 16)
      const timeHigh = parseInt(hex.substring(12, 16), 16) & 0x0fff

      const timestamp = (timeHigh << 32) + (timeMid << 16) + timeLow
      const unixTimestamp = (BigInt(timestamp) - 0x01b21dd213814000n) / 10000n

      return new Date(Number(unixTimestamp))
    } catch {
      return null
    }
  }
}

// 导出便捷函数
export const generateId = IdGenerator.uuid
export const generateShortId = IdGenerator.shortId
export const generateConversationId = IdGenerator.conversationId
export const generateMessageId = IdGenerator.messageId
export const generateProviderId = IdGenerator.providerId
