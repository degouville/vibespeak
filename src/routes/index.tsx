import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import Header from '../components/Header'
import LanguagePicker from '../components/LanguagePicker'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('vibespeak_session')
    if (stored) {
      try {
        JSON.parse(stored)
        navigate({ to: '/learn' })
      } catch {
        // invalid session, stay on onboarding
      }
    }
  }, [navigate])

  return (
    <>
      <Header />
      <LanguagePicker />
    </>
  )
}
