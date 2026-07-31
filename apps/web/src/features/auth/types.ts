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

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResult {
  accessToken: string
}

export interface RegisterInput {
  email: string
  password: string
  tenantName: string
}

export interface RegisterResult {
  user: { id: string; email: string }
  tenant: { id: string; name: string }
  accessToken: string
}
