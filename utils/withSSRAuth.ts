import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/authTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {

  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context)
    const token = cookies['nextAuth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }
    try {
      return await fn(context)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(context, 'nextAuth.token')
        destroyCookie(context, 'nextAuth.refreshToken')

        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }

      }
    }
  }
}