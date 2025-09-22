import api from './axios'
import { endpoints, fill } from './config'

export interface Group {
  groupId: number
  groupName: string
  groupDescription: string
}
export interface GroupMember {
  customerId: number
  name: string
  leader: boolean
  profileImageUrl?: string
}

export const GroupApi = {
  list: () => api.get<Group[]>(endpoints.group.list).then(r => r.data),
  create: (body: {
    groupLeaderId: number
    groupName: string
    groupDescription: string
  }) => api.post<Group>(endpoints.group.create, body).then(r => r.data),
  detail: (groupId: number) =>
    api.get<Group>(fill(endpoints.group.detail, { groupId })).then(r => r.data),
  members: (groupId: number) =>
    api
      .get<GroupMember[]>(fill(endpoints.group.members, { groupId }))
      .then(r => r.data),
  leave: (groupId: number) =>
    api
      .delete<void>(fill(endpoints.group.leave, { groupId }))
      .then(r => r.data),
}
