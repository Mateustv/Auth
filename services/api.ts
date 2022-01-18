import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext'
import { AuthTokenError } from './errors/authTokenError'

let isRefreshing = false
let failedRequestQueue = []

export function setupAPIClient(context = undefined) {
  let cookies = parseCookies(context)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextAuth.token']}`
    }
  })

  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {

        cookies = parseCookies(context)
        const { 'nextAuth.refreshToken': refreshToken } = cookies

        const originalConfing = error.config

        if (!isRefreshing) {
          isRefreshing = true

          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data

            setCookie(context, "nextAuth.token", token, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })
            setCookie(context, "nextAuth.refreshToken", response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            })
            api.defaults.headers['Authorization'] = `Bearer ${token}`

            failedRequestQueue.forEach(request => request.onSuccess(token))
            failedRequestQueue = []

          })
            .catch(error => {
              failedRequestQueue.forEach(request => request.onFailure(error))
              failedRequestQueue = []
              if (process.browser) {
                signOut()
              }

            })
            .finally(() => {
              isRefreshing = false
            })
        }
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfing.headers['Authorization'] = ` Bearer ${token}`
              resolve(api(originalConfing))
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            },
          })
        })

      } else {
        if (process.browser) {
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }
    return Promise.reject(error)
  })
  return api
}
