// 主题色常量
export const THEME_COLORS = {
  primary: '#40e0d0',      // tech-blue
  primaryHover: '#06b6d4', // tech-cyan
  primaryActive: '#6a11cb', // tech-purple
  success: '#40e0d0',       // tech-blue
  warning: '#ec4899',       // tech-pink
  error: '#ef4444',         // 红色
  info: '#06b6d4',          // tech-cyan
  dark: '#0f172a',          // tech-dark
  darker: '#0a0f1f',        // tech-darker
}

// 获取主题色
export const getThemeColor = (colorName) => {
  return THEME_COLORS[colorName] || THEME_COLORS.primary
}

// 获取渐变背景
export const getGradientBackground = (direction = '135deg', startColor = 'primary', endColor = 'primaryHover') => {
  const start = getThemeColor(startColor)
  const end = getThemeColor(endColor)
  return `linear-gradient(${direction}, ${start} 0%, ${end} 100%)`
}

// 获取阴影样式
export const getShadowStyle = (color = 'primary', intensity = 0.3) => {
  const themeColor = getThemeColor(color)
  return `0 4px 12px rgba(${hexToRgb(themeColor)}, ${intensity})`
}

// 十六进制颜色转RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ?
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '64, 224, 208'
}

// 获取CSS变量
export const getCSSVariable = (variableName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName)
}

// 设置CSS变量
export const setCSSVariable = (variableName, value) => {
  document.documentElement.style.setProperty(variableName, value)
}

// 应用主题色到CSS变量
export const applyThemeColors = () => {
  Object.entries(THEME_COLORS).forEach(([name, color]) => {
    setCSSVariable(`--theme-${name}`, color)
  })
}

// 获取主题配置对象
export const getThemeConfig = (isDark = false) => {
  return {
    colors: THEME_COLORS,
    isDark,
    gradient: getGradientBackground(),
    shadow: getShadowStyle(),
  }
}

// 主题色验证
export const isValidThemeColor = (color) => {
  return Object.values(THEME_COLORS).includes(color)
}

// 获取对比色（用于文字）
export const getContrastColor = (backgroundColor) => {
  const rgb = hexToRgb(backgroundColor).split(', ').map(Number)
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

// 主题色工具类
export class ThemeUtils {
  static colors = THEME_COLORS

  static getColor(name) {
    return getThemeColor(name)
  }

  static getGradient(startColor = 'primary', endColor = 'primaryHover', direction = '135deg') {
    return getGradientBackground(direction, startColor, endColor)
  }

  static getShadow(color = 'primary', intensity = 0.3) {
    return getShadowStyle(color, intensity)
  }

  static applyTheme() {
    applyThemeColors()
  }

  static getContrastText(backgroundColor) {
    return getContrastColor(backgroundColor)
  }
} 