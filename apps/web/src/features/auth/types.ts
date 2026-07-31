export interface CurrentUser {
  id: string
  email: string
  isPlatformAdmin: boolean
}

export interface CurrentUserResult {
  user: CurrentUser
  tenant: { id: string; name: string }
  role: string
}
