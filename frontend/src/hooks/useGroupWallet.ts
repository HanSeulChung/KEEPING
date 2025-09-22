import { Group, GroupApi, GroupMember } from '@/api/groupApi'
import { Tx, WalletApi, WalletBalance } from '@/api/walletApi'
import { useEffect, useState } from 'react'

export function useGroups() {
  const [data, setData] = useState<Group[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  useEffect(() => {
    ;(async () => {
      try {
        setData(await GroupApi.list())
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  return { data, loading, error }
}

export function useGroupBundle(groupId?: number) {
  const [group, setGroup] = useState<Group>()
  const [members, setMembers] = useState<GroupMember[]>()
  const [balances, setBalances] = useState<WalletBalance[]>()
  const [txs, setTxs] = useState<Tx[]>()
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (groupId == null) return
    GroupApi.detail(groupId).then(setGroup)
    GroupApi.members(groupId).then(setMembers)
    WalletApi.balances(groupId).then(setBalances)
  }, [groupId])

  useEffect(() => {
    if (groupId == null) return
    WalletApi.transactions(groupId, page).then(setTxs)
  }, [groupId, page])

  return { group, members, balances, txs, page, setPage }
}
