import { lazy, Suspense } from 'react'
import { StyleProvider, useStyle, STYLES } from './contexts/StyleContext'
import './App.css'

const LiquidGlassView = lazy(() => import('./components/styles/LiquidGlassView'))
const TerminalView = lazy(() => import('./components/styles/TerminalView'))
const MacOSDesktopView = lazy(() => import('./components/styles/MacOSDesktopView'))

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  )
}

function StyleRouter() {
  const { currentStyle } = useStyle()

  const renderStyle = () => {
    switch (currentStyle) {
      case STYLES.TERMINAL:
        return <TerminalView />
      case STYLES.MACOS_DESKTOP:
        return <MacOSDesktopView />
      case STYLES.LIQUID_GLASS:
      default:
        return <LiquidGlassView />
    }
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {renderStyle()}
    </Suspense>
  )
}

function App() {
  return (
    <StyleProvider>
      <StyleRouter />
    </StyleProvider>
  )
}

export default App
