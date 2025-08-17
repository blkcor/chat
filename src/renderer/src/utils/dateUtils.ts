import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化时间为 HH:mm 格式
 */
export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('HH:mm')
}

/**
 * 格式化完整日期时间
 */
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取相对时间（多久之前）
 */
export const getTimeAgo = (date: string | Date): string => {
  return dayjs(date).fromNow()
}

/**
 * 获取今天的开始时间
 */
export const getTodayStart = (): Date => {
  return dayjs().startOf('day').toDate()
}

/**
 * 获取今天的结束时间
 */
export const getTodayEnd = (): Date => {
  return dayjs().endOf('day').toDate()
}

/**
 * 检查是否是今天
 */
export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 检查是否是昨天
 */
export const isYesterday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * 智能格式化时间显示
 * 今天：显示时间
 * 昨天：显示"昨天"
 * 本周：显示星期几
 * 其他：显示日期
 */
export const smartFormatTime = (date: string | Date): string => {
  const target = dayjs(date)
  const now = dayjs()

  if (target.isSame(now, 'day')) {
    return target.format('HH:mm')
  } else if (target.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天'
  } else if (target.isSame(now, 'week')) {
    return target.format('dddd')
  } else if (target.isSame(now, 'year')) {
    return target.format('MM-DD')
  } else {
    return target.format('YYYY-MM-DD')
  }
}

/**
 * 创建当前时间戳
 */
export const now = (): string => {
  return dayjs().toISOString()
}

/**
 * 添加时间
 */
export const addTime = (
  date: string | Date,
  amount: number,
  unit: 'day' | 'hour' | 'minute' | 'second'
): string => {
  return dayjs(date).add(amount, unit).toISOString()
}

/**
 * 减去时间
 */
export const subtractTime = (
  date: string | Date,
  amount: number,
  unit: 'day' | 'hour' | 'minute' | 'second'
): string => {
  return dayjs(date).subtract(amount, unit).toISOString()
}
