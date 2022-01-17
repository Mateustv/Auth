import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import { parseCookies, setCookie } from 'nookies'

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
}
type AuthProviderProps = {
  children: ReactNode;
}


export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  useEffect(() => {
    const { 'nextAuth.token': token, } = parseCookies()

    if (token) {
      api.get("/me").then(response => {
        const { email, permissions, roles } = response.data
        setUser({ email, permissions, roles })
      })
    }
  }, [])

  async function signIn({ email, password }: SignCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { token, permissions, roles, refreshToken } = response.data

      setCookie(undefined, "nextAuth.token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      })
      setCookie(undefined, "nextAuth.refreshToken", refreshToken)

      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers['Authorization'] = token

      Router.push('/dashboard')

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )

}