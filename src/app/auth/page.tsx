import SignInPage from './page.client'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
}

export default function Page() {
  return <SignInPage />
}
