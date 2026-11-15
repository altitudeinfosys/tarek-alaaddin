import type { Subscriber } from '@/lib/db/schema'
import { notifyTarek } from './ackpush'

/** Push for a new (or re-subscribed) newsletter subscriber. Fire-and-forget. */
export function notifyNewSubscriber(subscriber: Subscriber, source: string, reactivated: boolean): void {
  const name = subscriber.firstName ? `${subscriber.firstName} · ` : ''
  notifyTarek({
    title: reactivated ? 'Subscriber came back' : 'New newsletter subscriber',
    body: `${name}${subscriber.email}\nSigned up from: ${source}`,
    priority: -1,
    thread_key: 'subscribers',
    metadata: { kind: 'subscriber' },
  })
}
