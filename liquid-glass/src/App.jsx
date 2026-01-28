import { lazy, Suspense } from 'react'
import { StyleProvider, useStyle, STYLES } from './contexts/StyleContext'
import LandingPage from './components/landing/LandingPage'
import './App.css'

// Lazy load style views for better performance
const LiquidGlassView = lazy(() => import('./components/styles/LiquidGlassView'))
const TerminalView = lazy(() => import('./components/styles/TerminalView'))
const GalaxyScrollView = lazy(() => import('./components/styles/GalaxyScrollView'))
const ClassicResumeView = lazy(() => import('./components/styles/ClassicResumeView'))
const NewspaperView = lazy(() => import('./components/styles/NewspaperView'))
const CinematicScrollView = lazy(() => import('./components/styles/CinematicScrollView'))
const KoreanNewspaperView = lazy(() => import('./components/styles/KoreanNewspaperView'))
const MacOSDesktopView = lazy(() => import('./components/styles/MacOSDesktopView'))

// Loading fallback
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading...</p>
    </div>
  )
}

// Style router component
function StyleRouter() {
  const { currentStyle, showLanding } = useStyle()

  if (showLanding) {
    return <LandingPage />
  }

  const renderStyle = () => {
    switch (currentStyle) {
      case STYLES.LIQUID_GLASS:
        return <LiquidGlassView />
      case STYLES.TERMINAL:
        return <TerminalView />
      case STYLES.GALAXY_SCROLL:
        return <GalaxyScrollView />
      case STYLES.CLASSIC_RESUME:
        return <ClassicResumeView />
      case STYLES.NEWSPAPER:
        return <NewspaperView />
      case STYLES.CINEMATIC_SCROLL:
        return <CinematicScrollView />
      case STYLES.KOREAN_NEWSPAPER:
        return <KoreanNewspaperView />
      case STYLES.MACOS_DESKTOP:
        return <MacOSDesktopView />
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
