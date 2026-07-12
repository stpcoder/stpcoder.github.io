import { Component, lazy, Suspense } from 'react'
import { StyleProvider, useStyle, STYLES } from './contexts/StyleContext'
import './App.css'

const LiquidGlassView = lazy(() => import('./components/styles/LiquidGlassView'))
const TerminalView = lazy(() => import('./components/styles/TerminalView'))
const MacOSDesktopView = lazy(() => import('./components/styles/MacOSDesktopView'))
const EditorialView = lazy(() => import('./components/styles/EditorialView'))
const BlueprintView = lazy(() => import('./components/styles/BlueprintView'))
const SnakeView = lazy(() => import('./components/styles/SnakeView'))

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  )
}

class PortfolioErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="portfolio-error-screen">
          <span>PORTFOLIO / RECOVERY</span>
          <h1>This view could not be loaded.</h1>
          <p>The cached deployment may be out of date. Reload to fetch the current version.</p>
          <button type="button" onClick={() => window.location.reload()}>Reload portfolio</button>
        </main>
      )
    }

    return this.props.children
  }
}

function StyleRouter() {
  const { currentStyle } = useStyle()

  const renderStyle = () => {
    switch (currentStyle) {
      case STYLES.TERMINAL:
        return <TerminalView />
      case STYLES.MACOS_DESKTOP:
        return <MacOSDesktopView />
      case STYLES.EDITORIAL:
        return <EditorialView />
      case STYLES.BLUEPRINT:
        return <BlueprintView />
      case STYLES.SNAKE:
        return <SnakeView />
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
    <PortfolioErrorBoundary>
      <StyleProvider>
        <StyleRouter />
      </StyleProvider>
    </PortfolioErrorBoundary>
  )
}

export default App
