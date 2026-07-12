// Every tier renders the same scene. Budgets cap physical pixels rather than
// blindly lowering DPR, so small mobile screens stay sharp while 4K screens
// cannot create disproportionately large render targets.
export const LIQUID_RENDER_BUDGETS = {
  full: {
    targetFps: 30,
    desktop: {
      mainPixels: 4_000_000,
      transmissionPixels: 1_500_000,
      dprCeiling: 1.5,
      dprFloor: 0.7,
      emergencyDprFloor: 0.55
    },
    mobile: {
      mainPixels: 1_250_000,
      transmissionPixels: 700_000,
      dprCeiling: 2,
      dprFloor: 1,
      emergencyDprFloor: 0.8
    }
  },
  efficient: {
    targetFps: 30,
    desktop: {
      mainPixels: 3_000_000,
      transmissionPixels: 1_200_000,
      dprCeiling: 1.25,
      dprFloor: 0.6,
      emergencyDprFloor: 0.5
    },
    mobile: {
      mainPixels: 1_000_000,
      transmissionPixels: 650_000,
      dprCeiling: 1.75,
      dprFloor: 1,
      emergencyDprFloor: 0.8
    }
  }
}

const TRANSMISSION_SCALE_MIN = 0.5
const TRANSMISSION_SCALE_MAX = 0.82

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function roundDpr(value) {
  return Math.round(value * 1000) / 1000
}

export function getLiquidRenderBudget({
  reducedGraphics = false,
  isMobile = false,
  devicePixelRatio = 1,
  viewportWidth = 1280,
  viewportHeight = 720
} = {}) {
  const mode = reducedGraphics ? 'efficient' : 'full'
  const preset = LIQUID_RENDER_BUDGETS[mode]
  const devicePreset = preset[isMobile ? 'mobile' : 'desktop']
  const nativeDpr = clamp(Number(devicePixelRatio) || 1, 0.5, 3)
  const width = Math.max(1, Number(viewportWidth) || 1280)
  const height = Math.max(1, Number(viewportHeight) || 720)
  const viewportPixels = width * height
  const pixelCappedDpr = Math.sqrt(devicePreset.mainPixels / viewportPixels)
  const hardFloor = Math.min(nativeDpr, devicePreset.emergencyDprFloor)
  const initialDpr = roundDpr(clamp(
    Math.min(nativeDpr, devicePreset.dprCeiling, pixelCappedDpr),
    hardFloor,
    devicePreset.dprCeiling
  ))
  const minDpr = roundDpr(Math.min(initialDpr, devicePreset.dprFloor))
  const emergencyDpr = roundDpr(Math.min(minDpr, devicePreset.emergencyDprFloor))
  const widthBucket = Math.round(width / 320)
  const heightBucket = Math.round(height / 240)
  const dprBucket = Math.round(nativeDpr * 4) / 4

  return {
    mode,
    targetFps: preset.targetFps,
    antialias: initialDpr < 1.6,
    initialDpr,
    minDpr,
    emergencyDpr,
    viewportPixels,
    transmissionPixelBudget: devicePreset.transmissionPixels,
    transmissionScaleMin: TRANSMISSION_SCALE_MIN,
    transmissionScaleMax: TRANSMISSION_SCALE_MAX,
    calibrationKey: `${mode}:${isMobile ? 'mobile' : 'desktop'}:${widthBucket}x${heightBucket}@${dprBucket}`
  }
}

export function getLiquidTransmissionScale(budget, dpr) {
  const renderedPixels = Math.max(1, budget.viewportPixels * dpr * dpr)
  const pixelCappedScale = Math.sqrt(budget.transmissionPixelBudget / renderedPixels)
  return Math.round(clamp(
    pixelCappedScale,
    budget.transmissionScaleMin,
    budget.transmissionScaleMax
  ) * 1000) / 1000
}

export function lowerLiquidDpr(currentDpr, minDpr, step = 0.125) {
  return roundDpr(Math.max(minDpr, currentDpr - step))
}

export function raiseLiquidDpr(currentDpr, maxDpr, step = 0.125) {
  return roundDpr(Math.min(maxDpr, currentDpr + step))
}
