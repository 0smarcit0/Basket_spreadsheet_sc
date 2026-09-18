import './global.css'

export const metadata = {
    title: 'Basket Spreadsheet SC',
    description: 'Gestor de planillas deportivas para SC',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
         <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <div id="root" className="min-h-screen flex flex-col">
            {children}
          </div>
         </body>
        </html>
    )
}