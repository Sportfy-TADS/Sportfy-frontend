import type { Metadata } from 'next'
import SignInPage from './page.client'
 
export const metadata: Metadata = {
  title:  'Login',
}
 
export default function Page() {
  return <SignInPage />
}