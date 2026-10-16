import './global.css'
import { SerwistProvider } from './serwist'
//import { AppBootstrap } from './app-bootstrap'

export const metadata = {
  title: 'Basket Spreadsheet SC',
  description: 'Gestor de planillas deportivas para SC',
}

export const viewport    = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <body className="antialiased h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
        <div id="root" className="h-[100dvh] flex flex-col">
          <SerwistProvider
            swUrl="./sw.ts"            // o "/sw.js" según tu setup
            reloadOnOnline={false}
            disable={process.env.NODE_ENV === 'development'}
          >
            {/* <AppBootstrap /> */}
            {children}
          </SerwistProvider>
        </div>
      </body>
    </html>
  )
}