import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hook/useCan"
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
    <>
      <h1>
        Dashboard {user?.email}
      </h1>
      <Can permissions={['metrics.list']}>
        <h2>Métricas</h2>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context)
  const response = await apiClient.get('/me')
  console.log(response.data)

  return {
    props: {}
  }
}
)