import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#07170f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Leafora" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/plant-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/plant-192.png" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
