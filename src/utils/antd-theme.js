import { theme } from 'ant-design-vue'

// 定义主题色
export const themeColors = {
  primary: '#40e0d0',      // tech-blue
  primaryHover: '#06b6d4', // tech-cyan
  primaryActive: '#6a11cb', // tech-purple
  success: '#40e0d0',       // tech-blue
  warning: '#ec4899',       // tech-pink
  error: '#ef4444',         // 红色
  info: '#06b6d4',          // tech-cyan
}

// 创建主题配置
export const createThemeConfig = (isDark = false) => {
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // 主色调
      colorPrimary: themeColors.primary,
      colorPrimaryHover: themeColors.primaryHover,
      colorPrimaryActive: themeColors.primaryActive,

      // 功能色
      colorSuccess: themeColors.success,
      colorWarning: themeColors.warning,
      colorError: themeColors.error,
      colorInfo: themeColors.info,

      // 圆角
      borderRadius: 8,

      // 禁用线框模式
      wireframe: false,

      // 暗色主题下的背景色调整
      ...(isDark && {
        colorBgContainer: '#0f172a',
        colorBgElevated: '#0a0f1f',
        colorBgLayout: '#0f172a',
        colorBgSpotlight: '#0a0f1f',
        colorBgMask: 'rgba(0, 0, 0, 0.8)',
      }),
    },
    components: {
      // 按钮配置
      Button: {
        borderRadius: 8,
        controlHeight: 40,
        fontSize: 14,
        fontWeight: 500,
      },

      // 输入框配置
      Input: {
        borderRadius: 8,
        controlHeight: 40,
        fontSize: 14,
      },

      // 选择器配置
      Select: {
        borderRadius: 8,
        controlHeight: 40,
        fontSize: 14,
      },

      // 模态框配置
      Modal: {
        borderRadius: 12,
        headerBg: isDark ? '#0a0f1f' : '#ffffff',
        contentBg: isDark ? '#0f172a' : '#ffffff',
      },

      // 卡片配置
      Card: {
        borderRadius: 12,
        headerBg: isDark ? '#0a0f1f' : '#ffffff',
        headerColor: isDark ? '#ffffff' : '#000000',
      },

      // 抽屉配置
      Drawer: {
        borderRadius: 12,
        headerBg: isDark ? '#0a0f1f' : '#ffffff',
        bodyBg: isDark ? '#0f172a' : '#ffffff',
      },

      // 通知配置
      Notification: {
        borderRadius: 12,
        colorBgElevated: isDark ? '#0a0f1f' : '#ffffff',
      },

      // 消息配置
      Message: {
        borderRadius: 8,
        colorBgElevated: isDark ? '#0a0f1f' : '#ffffff',
      },

      // 表格配置
      Table: {
        borderRadius: 8,
        headerBg: isDark ? '#0a0f1f' : '#fafafa',
        headerColor: isDark ? '#ffffff' : '#000000',
      },

      // 分页配置
      Pagination: {
        borderRadius: 6,
      },

      // 标签页配置
      Tabs: {
        borderRadius: 8,
        cardBg: isDark ? '#0a0f1f' : '#ffffff',
      },

      // 菜单配置
      Menu: {
        borderRadius: 6,
        itemBg: isDark ? 'transparent' : 'transparent',
        itemSelectedBg: isDark ? '#40e0d0' : '#e6f7ff',
        itemSelectedColor: isDark ? '#000000' : '#40e0d0',
      },

      // 下拉菜单配置
      Dropdown: {
        borderRadius: 8,
        colorBgElevated: isDark ? '#0a0f1f' : '#ffffff',
      },

      // 工具提示配置
      Tooltip: {
        borderRadius: 6,
        colorBgSpotlight: isDark ? '#0a0f1f' : '#000000',
      },

      // 进度条配置
      Progress: {
        borderRadius: 4,
      },

      // 滑块配置
      Slider: {
        borderRadius: 4,
      },

      // 开关配置
      Switch: {
        borderRadius: 12,
      },
    },
  }
}

// 导出默认主题配置
export const defaultThemeConfig = createThemeConfig(false)
export const darkThemeConfig = createThemeConfig(true) 