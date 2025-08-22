import { Conversation } from '@renderer/types/conversation'
import { Message } from '@renderer/types/message'
import { Provider } from '@renderer/types/provider'
import Dexie, { type EntityTable } from 'dexie'
import { providers } from '../constants/data'

export const db = new Dexie('chat') as Dexie & {
  providers: EntityTable<Provider, 'id'>
  conversations: EntityTable<Conversation, 'id'>
  messages: EntityTable<Message, 'id'>
}

db.version(1).stores({
  providers: 'id, name',
  conversations: 'id, providerId, createdAt, updatedAt',
  messages: 'id, conversationId, createdAt, updatedAt, type, renderedContent'
})

export const initProvider = async () => {
  const count = await db.providers.count()
  if (count === 0) {
    // 初始化添加数据
    await db.providers.bulkAdd(providers)
  }
}
