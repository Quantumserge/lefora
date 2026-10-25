import type { AppProps } from 'next/app'
import PwaSetup from '../components/PwaSetup'
import '../styles/globals.css'
import '../components/nursery/nursery.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <><PwaSetup /><Component {...pageProps} /></>
}
