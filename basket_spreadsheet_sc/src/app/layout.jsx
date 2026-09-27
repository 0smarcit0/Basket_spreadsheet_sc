import './global.css'
export const metadata = {
    title: 'Basket Spreadsheet SC',
    description: 'Gestor de planillas deportivas para SC',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="es" className="h-full">
         <body className="antialiased h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
          <div id="root" className="h-[100dvh] flex flex-col">
            {children}
          </div>
         </body>
        </html>
    )
}