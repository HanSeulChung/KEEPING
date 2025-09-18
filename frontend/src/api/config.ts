const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

export const endpoints = {
  auth: {
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    socialLogin: '/auth/{provider}/login',
    phonerequest: '/otp/request',
    phoeverify: 'otp/verify',
  },
  customer: {
    signup: '/customers',
    me: '/customers/me',
  },
  owner: {
    signup: '/owners',
  },
  group: {
    create: '/groups',
    search: '/groups/{groupId}',
    members: '/groups/{groupId}/group-members',
    request: '/groups/{groupId}/add-requests',
    searchRequest: '/groups/{groupId}/add-requests?status=PENDING',
    responseRequest: '/groups/{groupId}/add-requests',
    enterGroup: '/groups/{groupId}/entrance',
    searchGroupbyName: '/groups?name={groupName}',
    changeLeader: '/groups/{groupId}/group-leader',
    removeMember: '/groups/{groupId}/group-member',
    leaveGroup: '/groups/{groupId}/group-member',
    deleteGroup: '/groups/{groupId}',
  },
  stores: {
    search: '/stores',
    searchById: '/stores/{storeId}',
    searchByName: '/stores?name={storeName}',
    createCategory: '/stores/{storeId}/menus/categories',
    updateCategory: '/stores/{storeId}/menus/categories/{categoryId}',
    deleteCategory: '/stores/{storeId}/menus/categories/{categoryId}',
    listCategory: '/stores/{storeId}/menus/categories',
    register: '/owners/stores',
    deleteStore: '/owners/stores/{storeId}',
  },
  menu: {
    list: '/stores/{storeId}/menus',
    create: '/stores/{storeId}/menus',
    update: '/stores/{storeId}/menus/{menuId}',
    partialDelete: '/stores/{storeId}/menus/{menuId}',
    allDelete: '/stores/{storeId}/menus',
  },
  likes: {
    like: '/stores/{storeId}',
    unlike: '/stores/{storeId}',
  },
} as const
