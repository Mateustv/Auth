import { FormEvent, useContext, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import styles from '../styles/Home.module.scss'
import { withSSRGuest } from "../utils/WithSSRGuest"

export default function Home() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const { signIn } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password,
    }

    await signIn(data)
  }


  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formClass}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export const getServerSideProps = withSSRGuest(async (context) => {
  return {
    props: {}
  }
}
)