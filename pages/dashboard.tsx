import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function DashBoard() {

  const { user } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me')
      .then((res) => { console.log(res) })
      .catch((err) => console.log(err))
  }, [])

  return (
    <h1>
      Dashboard {user?.email}
    </h1>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context)
  const response = await apiClient.get('/me')

  console.log(response)
  return {
    props: {}
  }
}
)