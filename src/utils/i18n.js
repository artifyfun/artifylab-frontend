// 国际化工具
import { ref, computed, inject } from 'vue'

// 全局语言状态
const currentLang = ref('zh')

// 设置当前语言
export function setLanguage(lang) {
  currentLang.value = lang
}

// 获取当前语言
export function getCurrentLanguage() {
  return currentLang.value
}

const translations = {
  zh: {
    // 通用操作
    backToHome: '返回首页',
    settings: '设置',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    export: '导出',
    close: '关闭',
    loading: '加载中...',
    preview: '预览',
    download: '下载',
    copy: '复制',
    load: '加载',
    install: '安装',
    features: '功能特性',

    // 应用相关
    comfyui: 'ComfyUI',
    aiAppCenter: 'AI 应用 中心',
    exploreFrontierAI: '让天下没有难做的AI应用，每个人都能体验AI的魅力',
    about: '关于',

    // 预览相关
    backToEditor: '返回编辑器',
    refreshPreview: '刷新预览',
    refreshPreviewTitle: '刷新预览',
    refreshPreviewMessage: '刷新预览',
    aiWorking: 'AI 正在工作中...',
    autoRefresh: '自动刷新',
    autoRefreshEnabled: '自动刷新已开启',
    autoRefreshDisabled: '自动刷新已关闭，点击手动刷新',
    manualRefreshPreview: '手动刷新预览内容',

    // 模板相关
    saveTemplate: '保存模板',
    saveTemplateTitle: '保存为模板',
    saveAsTemplate: '保存为模板',
    templateName: '模板名称',
    templateNamePlaceholder: '请输入模板名称',
    pleaseEnterTemplateName: '请输入模板名称',
    templateLoadSuccess: '模板加载成功',
    templateSaveSuccess: '模板保存成功',
    templateSaveFailed: '模板保存失败',
    templatesList: '模板列表',
    noSavedTemplates: '暂无保存的模板',
    loadTemplate: '加载模板',
    deleteConfirmTitle: '确认删除',
    deleteConfirmMessage: '确定要删除这个模板吗？此操作不可撤销。',

    // 操作结果
    copySuccess: '复制成功',
    copyFailed: '复制失败',
    downloadSuccess: '下载成功',
    downloadFailed: '下载失败',
    loadFailed: '加载失败',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    saveSuccess: '保存成功',

    // 更多操作
    moreActions: '更多操作',
    copySourceCode: '复制源代码',

    // 内容状态
    noContent: '暂无内容',

    // 配置相关
    language: '语言',
    chinese: '中文',
    english: 'English',
    provider: '供应商',
    baseUrl: 'Base URL',
    apiKey: 'API Key',
    maxTokens: '最大令牌数',
    creativity: '创造力',
    precise: '精准',
    balanced: '平衡',
    creative: '创意',
    model: '模型',
    presetModels: '预设模型',
    customModel: '自定义模型',
    enterCustomModel: '请输入自定义模型名称',
    saveSettings: '保存设置',
    testConnection: '测试连接',
    testing: '测试中...',
    connectionTestSuccessful: '连接测试成功',
    connectionTestFailed: '连接测试失败',
    connectionTestError: '连接测试出错',
    pleaseCompleteAllFields: '请完善所有必填字段',

    // 配置分类
    baseConfig: '基础配置',
    buildConfig: '构建配置',
    shareApps: '应用分享',
    quickActions: '快捷操作',

    // 应用风格
    appStyle: '应用风格',
    appStyleDescription: '自定义应用界面样式，支持HTML和CSS代码',
    appFunction: '应用功能',
    appFunctionDescription: '描述应用的功能和交互逻辑',
    advancedConfig: '高级配置',
    previewPlaceholder: '预览将在这里显示',
    pleaseInputStyleAndFunction: '请输入应用风格和功能描述',
    modernStyle: '现代风',
    classicStyle: '经典风',
    minimalStyle: '极简风',
    techStyle: '科技风',
    presetStyles: '预设风格',
    fetchStyleError: '获取风格失败',
    selectAppStyle: '选择应用风格',
    styleSelectionDescription: '请选择一个应用风格，这将影响生成的应用界面样式',
    loadingStyles: '加载风格中...',
    pleaseSelectStyle: '请选择一个应用风格',
    noDescription: '暂无描述',
    noBuildStyles: '暂无应用风格',

    // Ngrok相关
    ngrokAuthtoken: 'Ngrok Authtoken',
    enterNgrokAuthtoken: '请输入Ngrok Authtoken',
    testNgrok: '生成分享链接',
    testingNgrok: '生成中...',
    ngrokSuccess: '分享链接生成成功',
    ngrokFail: '分享链接生成失败',
    ngrokFillToken: '请填写ngrok authtoken',

    // 分享相关
    shareUrl: '分享链接',
    copyLink: '复制链接',
    exportApps: '批量导出应用',
    importApps: '批量导入应用',
    importAppsError: '导入失败，文件格式错误',
    noAppsToExport: '暂无应用可导出',

    // 快捷操作
    openRootFolder: '打开根目录',
    openInputFolder: '打开输入文件夹',
    openOutputFolder: '打开输出文件夹',
    openPluginsFolder: '打开插件文件夹',
    openModelsFolder: '打开模型文件夹',
    openFolderError: '打开文件夹失败',

    // 错误和状态
    requestFail: '请求失败',
    networkError: '网络错误',

    // 关于页面
    aboutArtifyWorkshop: '关于Artify工坊',
    aboutIntro: '专注AI绘画工作流研究与精品应用分享！我计划每日发布一款有趣的AI绘画App，并详解其核心工作流。无论你是设计师、创作者还是技术爱好者，这里都能帮你提升AI绘画效率，玩出专业级效果。',
    dailyUpdates: '每日更新AI绘画工具与技巧',
    workflowAnalysis: '深度解析核心工作流原理',
    professionalEffects: '专业级艺术效果实现方案',
    exclusiveTemplates: '独家工作流模板下载',
    artifyWorkshop: 'Artify工坊',
    scanToFollow: '扫码关注公众号',
    getAIWorkflowResources: '获取AI绘画工作流资源',
    aiPaintingWorkflowPlatform: 'AI工作流平台',
    exploreAICreationPossibilities: '探索AI艺术创作的无限可能，体验前沿科技与艺术的完美融合',
    followOfficialAccountForWorkflows: '关注我开始AI之旅',
    copyright: '© 2025 ArtifyFun. 本软件遵循 {license} 开源协议',
    gplv3: 'GPLv3',

    // 历史记录
    history: '历史记录',
    noHistoryRecords: '暂无历史记录',
    historyDeleted: '历史记录已删除',
    deleteHistoryRecord: '删除历史记录',
    deleteHistoryConfirm: '确定要删除搜索历史"{history}"吗？',

    // 参数管理
    paramName: '变量名称',
    alias: '别名',
    paramType: '变量类型',
    belongingNode: '所属节点',
    operation: '操作',
    renderComponent: '渲染组件',
    textarea: '多行文本',
    switch: '开关',
    slider: '滑块',
    inputNumber: '数字输入框',
    imageUploader: '图片上传',
    audioUploader: '音频上传',
    videoUploader: '视频上传',
    fileUploader: '文件上传',
    select: '下拉选择',
    postImage: '图片预览',
    audio: '音频',
    video: '视频',
    text: '文本',
    input: '输入',
    output: '输出',
    pleaseAddParams: '请右键节点提取变量',

    // 应用市场
    market: '应用市场',
    myApps: '我的应用',
    exploreMarketApps: '探索丰富的AI应用市场，发现优质工具和解决方案',
    tryOtherKeywords: '尝试其他关键词',
    marketEmptyDescription: '暂无应用，请稍后再来查看',
    filteredResults: '筛选结果: {count} 个',
    totalDownloads: '总下载量: {count}',
    appAlreadyInstalled: '应用已安装',
    appAlreadyInstalledConfirm: '应用 "{name}" 已经安装，是否覆盖安装？',
    installSuccess: '应用 "{name}" 安装成功',
    installFailed: '安装失败',
    previewNotAvailable: '预览功能暂不可用',
    appsOnline: '个应用在线',
    searchApps: '搜索应用名称或类型...',
    searchHistory: '搜索历史',
    noSearchHistory: '暂无搜索历史',
    searchHistoryTip: '开始搜索后，历史记录将显示在这里',
    searchSuggestions: '搜索建议',
    clearAllHistory: '清除全部历史',
    foundResults: '找到 {count} 个匹配结果',
    totalApps: '共 {count} 个应用',
    category: '分类',

    // 应用创建和管理
    createApp: '创建应用',
    addNewApp: '新增应用',
    createNew: '全新创建',
    importApp: '应用导入',
    editSourceCode: '编辑源代码',
    rebuild: '重新构建',
    launchApp: '启动应用',
    createdOn: '创建于 {date}',
    workflowEditor: '编辑工作流',
    sourceCode: '源代码',
    appBuilding: '应用构建',
    waitingAIResponse: '等待AI响应...',
    aiBuilding: 'AI正在努力构建中。。。',
    aiBuild: 'AI构建',
    backToStyle: '返回风格选择',
    localBuild: '本地构建',
    startBuild: '开始构建',
    stopBuilding: '终止构建',
    rebuildApp: '重新构建',
    saveApp: '保存',
    pleaseEnterAppName: '请输入应用名称',
    pleaseEnterAppDescription: '请输入应用描述',
    pleaseUploadWorkflow: '请上传工作流',
    currentAppCodeExists: '当前应用代码已存在，是否重新生成？',
    rebuildAppTip: '重新生成应用将覆盖现在的应用代码',
    buildApp: '构建应用',
    appNotBuilt: '当前应用未构建，是否先构建？构建可能需要几分钟',
    pleaseEnterCode: '请输入代码',
    rateLimitExceeded: '请求频率超限，请稍后再试',
    rateLimitWaitMinutes: '请求频率超限，请 {minutes} 分钟后再试',
    generationStopped: '生成已停止',
    aiResponseSuccess: 'AI响应成功',
    processingResponseFailed: '处理响应失败',
    aiResponseError: 'AI响应错误',
    aiRequestFailed: 'AI请求失败',
    noAppsFound: '没有找到匹配的应用',
    noAppsAvailable: '暂无AI应用',
    noAppsFoundWithQuery: '没有找到包含"{query}"的应用，请尝试其他关键词',
    noAppsInCategory: '没有找到"{category}"分类的应用',
    addFirstAppTip: '点击左上角的"新增应用"按钮，开始添加您的第一个AI应用，或者从应用市场安装应用',
    clearSearch: '清除搜索',
    clearFilter: '清除筛选',
    editApp: '编辑应用',
    pleaseSetApiKey: '请先设置API Key',

    // 视图模式
    gridView: '网格视图',
    compactView: '紧凑视图',
    viewDetail: '查看详情',
    nodes: '节点',
    fromMarket: '来自市场',
    addNewAppTitle: '添加新应用',
    appName: '应用名称',
    appNamePlaceholder: '输入应用名称',
    appDescription: '应用描述',
    appDescriptionPlaceholder: '输入应用描述',
    coverImageUrl: '封面图片',
    uploadImage: '上传图片',
    coverImageUrlPlaceholder: 'https://example.com/imageUrl.jpg',
    appCategory: '应用类别',
    workflow: '工作流',
    editWorkflow: '编辑工作流',
    exportWorkflow: '导出工作流',
    uploadWorkflow: '上传工作流',
    reuploadWorkflow: '重新上传',
    imageGeneration: '图像生成',
    videoGeneration: '视频生成',
    textProcessing: '文本处理',
    speechRecognition: '语音识别',
    dataAnalysis: '数据分析',
    intelligentAssistant: '智能助手',
    app: '应用',
    center: '中心',
    missingWorkflow: '缺少工作流，请先上传工作流',
    runWorkflow: '运行工作流',
    batchMode: '批量模式',
    batchModeDescription: '批量处理数据，提高工作效率',
    selectSource: '选择来源',
    selectSourceDesc: '选择批量数据的来源',
    mapData: '数据映射',
    mapDataDesc: '将数据字段映射到应用输入',
    execute: '执行',
    executeDesc: '执行批量处理任务',
    selectBatchSource: '选择批量数据来源',
    fileDirectory: '文件目录',
    uploadFile: '上传文件',
    writeJSON: '编写JSON',
    selectDirectory: '选择目录',
    directoryPathPlaceholder: '请选择包含文件的目录',
    browse: '浏览',
    foundFiles: '找到文件',
    all: '全部',
    filesOnly: '仅文件',
    directoriesOnly: '仅目录',
    imagesOnly: '仅图片',
    videosOnly: '仅视频',
    audiosOnly: '仅音频',
    textsOnly: '仅文本',
    documentsOnly: '仅文档',
    andMoreFiles: '还有 {count} 个文件...',
    supportedFormats: '支持格式',
    inputJSON: '输入JSON',
    jsonFormatHint: '请输入有效的JSON数组格式，每个对象代表一个数据项',
    dataPreview: '数据预览',
    items: '项',
    andMoreItems: '还有 {count} 项...',
    mapDataFields: '映射数据字段',
    availableData: '可用数据',
    targetInputs: '目标输入',
    dragFieldHere: '拖拽字段到这里',
    executeBatchProcessing: '执行批量处理',
    batchSize: '批次大小',
    concurrentLimit: '并发限制',
    executionPreview: '执行预览',
    totalItems: '总项目数',
    mappedFields: '已映射字段',
    estimatedTime: '预计时间',
    estimatedRemaining: '预计剩余时间',
    startBatchExecution: '开始批量执行',
    previous: '上一步',
    next: '下一步',
    minutes: '分钟',
    seconds: '秒',
    lessThanOneSecond: '<1秒',
    dayUnit: '天',
    hourUnit: '小时',
    minuteUnit: '分',
    secondUnit: '秒',
    timeUnitSeparator: ' ',
    electronNotAvailable: 'Electron环境不可用',
    selectDirectoryFailed: '选择目录失败',
    scanDirectoryFailed: '扫描目录失败',
    unsupportedFileType: '不支持的文件类型',
    fileTooLarge: '文件过大，请选择小于10MB的文件',
    fileProcessingFailed: '文件处理失败',
    excelFileEmpty: 'Excel文件为空，请检查文件内容',
    excelNoValidData: 'Excel文件中没有有效数据',
    excelParseFailed: 'Excel文件解析失败',
    excelFileReadFailed: 'Excel文件读取失败',
    excelFileParsedSuccessfully: 'Excel文件解析成功',
    invalidDataFormat: '数据格式无效',
    fileParseFailed: '文件解析失败',
    fileParsedSuccessfully: '文件解析成功',
    noDataToProcess: '没有可处理的数据',
    noMappedFields: '没有映射的字段',
    batchExecutionStarted: '批量执行已开始',
    batchExecutionFailed: '批量执行失败',
    executionSettings: '执行设置',
    startFromItem: '从第几项开始',
    startFromItemPlaceholder: '请输入开始位置',
    startFromItemHint: '从第1项开始，最大为总项目数',
    executionProgress: '执行进度',
    processed: '已处理',
    total: '总数',
    currentItem: '当前项目',
    executionLogs: '执行日志',
    clearLogs: '清除日志',
    stopExecution: '停止执行',
    executionStopped: '执行已停止',
    executionStoppedByUser: '执行已被用户停止',
    stopExecutionFailed: '停止执行失败',
    itemProcessedSuccessfully: '第 {index} 项处理成功',
    itemProcessingFailed: '第 {index} 项处理失败',
    batchExecutionCompleted: '批量执行完成，共处理 {total} 项，成功 {success} 项，失败 {failed} 项',
    openOutputDirectory: '打开输出目录',
    outputDirectoryOpened: '输出目录已打开',
    openOutputDirectoryFailed: '打开输出目录失败',
    selectFile: '选择文件',
    dragTip: '拖动左侧字段到右侧输入框进行映射',

    // 错误消息
    cannotReadWorkflowInfo: '无法读取工作流信息',
    appParseError: '应用解析错误',
    workflowSaveFailed: '工作流保存失败：{error}',
    pleaseBuildAppFirst: '请先构建应用',
    importSuccess: '成功导入 {count} 个应用',
    noValidAppsFound: '未找到有效的应用数据',
    onlyJsonFilesAllowed: '只能导入JSON文件',

    // 通用错误提示
    serverError: '服务器错误',
    unknownError: '未知错误',
    operationFailed: '操作失败',
    saveFailed: '保存失败',
    uploadFailed: '上传失败',
    validationError: '验证错误',
    permissionDenied: '权限不足',
    timeoutError: '请求超时',
    invalidInput: '输入无效',
    fileNotFound: '文件未找到',
    dataNotFound: '数据未找到',
    connectionFailed: '连接失败',

    // 应用相关错误提示
    configLoadFailed: '配置加载失败',
    configSaveFailed: '配置保存失败',
    appsLoadFailed: '应用列表加载失败',
    addAppFailed: '添加应用失败',
    removeAppFailed: '删除应用失败',
    updateAppFailed: '更新应用失败',
    importAppsFailed: '导入应用失败',
    getAppFailed: '获取应用失败',
    buildStylesLoadFailed: '应用风格加载失败',

    // 其他功能
    basic: '基础',
    intermediate: '中级',
    advanced: '高级',
    professional: '专业',
    mainFeatures: '主要功能',
    advancedNLP: '高级自然语言处理能力',
    multimodalData: '多模态数据理解与分析',
    realtimeResponse: '实时响应与智能决策',
    confirmDelete: '确定删除',

    // 404页面
    pageNotFound: '页面未找到',
    pageNotFoundDescription: '抱歉，您访问的页面不存在或已被移动。',
    goBack: '返回上页',
    youCanTry: '您可以尝试：',
    checkUrlSpelling: '检查URL拼写是否正确',
    useNavigationMenu: '使用导航菜单浏览其他页面',
    contactAdmin: '联系管理员获取帮助',

    // AI编辑功能
    aiEdit: 'AI辅助修改',
    aiEditPlaceholder: '请输入需要修改页面的地方，比如"配色改为亮色系，按钮改为圆角"',
    aiEditTip: '输入你希望修改页面的地方，比如"配色改为亮色系，按钮改为圆角"',
    aiEditStop: '停止',
    aiEditRunning: 'AI正在修改中...',
    aiEditSuccess: 'AI修改成功',
    aiEditFailed: 'AI修改失败',

    // 优化提示词
    optimizePrompt: '优化提示词',
    optimizePromptConfirm: '将使用AI优化当前提示词，优化结果会覆盖当前内容，是否继续？',

    // 删除确认
    deleteApp: '删除应用',
    deleteAppConfirm: '确定删除应用 {name} 吗？',

    // 评分和创建时间
    rating: '评分',

    // 刷新相关
    refreshFailed: '刷新iframe失败',
    aiWorkingEnd: 'AI工作结束，更新预览内容',

    // 通用状态
    success: '成功',
    failed: '失败',
    error: '错误',
    warning: '警告',
    info: '信息',
    startFromItemLabel: '开始执行项：',
    currentProcessingLabel: '当前处理：',

    // 更新相关
    checkForUpdates: '检查更新',
    checkingForUpdates: '检查更新中...',
    updateAvailable: '发现新版本',
    downloadingUpdate: '下载更新中...',
    updateDownloaded: '更新已下载完成',
    alreadyLatestVersion: '已是最新版本',
    currentVersion: '当前版本',
    newVersion: '新版本',
    downloadUpdate: '下载更新',
    installUpdate: '重启并安装',
    restartAndInstall: '重启并安装',
    checkUpdateFailed: '检查更新失败',
    downloadUpdateFailed: '下载更新失败',
    installUpdateFailed: '安装更新失败',
    checking: '检查中...',
    later: '稍后再说',
    laterRestart: '稍后重启',
    autoUpdate: '自动更新',
    updateInProgress: '更新进行中',
    pleaseWait: '请稍候',
    clickToRestart: '点击下方按钮重启应用并安装更新',
    versionAvailable: '版本 {version} 已可用',
    checkingForNewVersion: '正在检查是否有新版本可用',
    downloadingNewVersion: '正在下载新版本，请稍候',
    currentVersionIsLatest: '当前版本 {version} 已是最新版本',
    updateCheckError: '检查更新失败',
    updateDownloadError: '下载更新失败',
    updateInstallError: '安装更新失败',

    // 提示消息
    updateAvailableMessage: '发现新版本 {version}，可以下载更新',
    noUpdateAvailableMessage: '当前已是最新版本，无需更新',
    updateDownloadedMessage: '更新已下载完成，可以重启安装',
    updateCheckFailedMessage: '检查更新失败，请稍后重试',
    updateDownloadFailedMessage: '下载更新失败，请检查网络连接',
    updateInstallFailedMessage: '安装更新失败，请稍后重试',

    // 手动更新相关
    manualUpdateTip: '如果自动更新失败，您可以手动下载最新版本',
    manualUpdateAvailable: '您也可以手动检查GitHub发布页面获取最新版本',
    downloadFromGitHub: '从GitHub下载',
    checkGitHubReleases: '查看GitHub发布',
    manualDownload: '手动下载',
    confirmManualDownload: '即将打开GitHub发布页面，您可以在那里下载最新版本。是否继续？',
    openingGitHubMessage: '正在打开GitHub发布页面...',
    manualDownloadError: '打开GitHub页面失败，请手动访问发布页面'
  },
  en: {
    // 通用操作
    backToHome: 'Back to Home',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    export: 'Export',
    close: 'Close',
    loading: 'Loading...',
    preview: 'Preview',
    download: 'Download',
    copy: 'Copy',
    load: 'Load',
    install: 'Install',
    features: 'Features',

    // 应用相关
    comfyui: 'ComfyUI',
    aiAppCenter: 'AI App Center',
    exploreFrontierAI: 'Make AI easier to use',
    about: 'About',

    // 预览相关
    backToEditor: 'Back to Editor',
    refreshPreview: 'Refresh Preview',
    refreshPreviewTitle: 'Refresh Preview',
    refreshPreviewMessage: 'Preview refreshed',
    aiWorking: 'AI is working...',
    autoRefresh: 'Auto Refresh',
    autoRefreshEnabled: 'Auto refresh enabled',
    autoRefreshDisabled: 'Auto refresh disabled, click to refresh manually',
    manualRefreshPreview: 'Manual refresh preview content',

    // 模板相关
    saveTemplate: 'Save Template',
    saveTemplateTitle: 'Save as Template',
    saveAsTemplate: 'Save as Template',
    templateName: 'Template Name',
    templateNamePlaceholder: 'Please enter template name',
    pleaseEnterTemplateName: 'Please enter template name',
    templateLoadSuccess: 'Template loaded successfully',
    templateSaveSuccess: 'Template saved successfully',
    templateSaveFailed: 'Template save failed',
    templatesList: 'Templates List',
    noSavedTemplates: 'No saved templates',
    loadTemplate: 'Load Template',
    deleteConfirmTitle: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete this template? This action cannot be undone.',

    // 操作结果
    copySuccess: 'Copy successful',
    copyFailed: 'Copy failed',
    downloadSuccess: 'Download successful',
    downloadFailed: 'Download failed',
    loadFailed: 'Load failed',
    deleteSuccess: 'Delete successful',
    deleteFailed: 'Delete failed',
    saveSuccess: 'Save successful',

    // 更多操作
    moreActions: 'More Actions',
    copySourceCode: 'Copy Source Code',

    // 内容状态
    noContent: 'No content',

    // 配置相关
    language: 'Language',
    chinese: '中文',
    english: 'English',
    provider: 'Provider',
    baseUrl: 'Base URL',
    apiKey: 'API Key',
    maxTokens: 'Max Tokens',
    creativity: 'Creativity',
    precise: 'Precise',
    balanced: 'Balanced',
    creative: 'Creative',
    model: 'Model',
    presetModels: 'Preset Models',
    customModel: 'Custom Model',
    enterCustomModel: 'Enter custom model name',
    saveSettings: 'Save Settings',
    testConnection: 'Test Connection',
    testing: 'Testing...',
    connectionTestSuccessful: 'Connection test successful',
    connectionTestFailed: 'Connection test failed',
    connectionTestError: 'Connection test error',
    pleaseCompleteAllFields: 'Please complete all required fields',

    // 配置分类
    baseConfig: 'Base Config',
    buildConfig: 'Build Config',
    shareApps: 'Share Apps',
    quickActions: 'Quick Actions',

    // 应用风格
    appStyle: 'App Style',
    appStyleDescription: 'Customize app interface style, supports HTML and CSS code',
    appFunction: 'App Function',
    appFunctionDescription: 'Describe app functionality and interaction logic',
    advancedConfig: 'Advanced Config',
    previewPlaceholder: 'Preview will be displayed here',
    pleaseInputStyleAndFunction: 'Please enter app style and function description',
    modernStyle: 'Modern',
    classicStyle: 'Classic',
    minimalStyle: 'Minimal',
    techStyle: 'Tech',
    presetStyles: 'Preset Styles',
    fetchStyleError: 'Failed to fetch styles',
    selectAppStyle: 'Select App Style',
    styleSelectionDescription: 'Please select an app style, this will affect the generated app interface style',
    loadingStyles: 'Loading styles...',
    pleaseSelectStyle: 'Please select an app style',
    noDescription: 'No description',
    noBuildStyles: 'No build styles',

    // Ngrok相关
    ngrokAuthtoken: 'Ngrok Authtoken',
    enterNgrokAuthtoken: 'Enter Ngrok Authtoken',
    testNgrok: 'Generate share link',
    testingNgrok: 'Generating...',
    ngrokSuccess: 'Share link generated successfully',
    ngrokFail: 'Share link generation failed',
    ngrokFillToken: 'Please enter ngrok authtoken',

    // 分享相关
    shareUrl: 'Share URL',
    copyLink: 'Copy Link',
    exportApps: 'Export Apps',
    importApps: 'Import Apps',
    importAppsError: 'Import failed, invalid file format',
    noAppsToExport: 'No apps to export',

    // 快捷操作
    openRootFolder: 'Open Root Folder',
    openInputFolder: 'Open Input Folder',
    openOutputFolder: 'Open Output Folder',
    openPluginsFolder: 'Open Plugins Folder',
    openModelsFolder: 'Open Models Folder',
    openFolderError: 'Failed to open folder',

    // 错误和状态
    requestFail: 'Request failed',
    networkError: 'Network error',

    // 关于页面
    aboutArtifyWorkshop: 'About ArtifyLab',
    aboutIntro: 'Focus on AI painting workflow research and quality application sharing! We publish one efficient and interesting AI painting App daily, and explain its core workflow in detail. Whether you are a designer, creator or technology enthusiast, here you can help improve AI painting efficiency and achieve professional-level effects.',
    dailyUpdates: 'Daily updates of AI painting tools and techniques',
    workflowAnalysis: 'In-depth analysis of core workflow principles',
    professionalEffects: 'Professional-level art effect implementation solutions',
    exclusiveTemplates: 'Exclusive workflow template downloads',
    artifyWorkshop: 'ArtifyLab',
    scanToFollow: 'Follow Me',
    getAIWorkflowResources: 'Get workflows and Apps',
    aiPaintingWorkflowPlatform: 'AI Workflow Platform',
    exploreAICreationPossibilities: 'Explore unlimited possibilities of AI art creation, experience the perfect fusion of cutting-edge technology and art',
    followOfficialAccountForWorkflows: 'Follow me for AI workflows',
    copyright: '© 2025 ArtifyFun. This software is licensed under the {license} open source license',
    gplv3: 'GPLv3',

    // 历史记录
    history: 'History',
    noHistoryRecords: 'No history records',
    historyDeleted: 'History record deleted',
    deleteHistoryRecord: 'Delete History Record',
    deleteHistoryConfirm: 'Are you sure you want to delete search history "{history}"?',

    // 参数管理
    paramName: 'Variable Name',
    alias: 'Alias',
    paramType: 'Variable Type',
    belongingNode: 'Belonging Node',
    operation: 'Operation',
    renderComponent: 'Render Component',
    textarea: 'Textarea',
    switch: 'Switch',
    slider: 'Slider',
    inputNumber: 'Input Number',
    imageUploader: 'Image Uploader',
    audioUploader: 'Audio Uploader',
    videoUploader: 'Video Uploader',
    fileUploader: 'File Uploader',
    select: 'Select',
    postImage: 'Image',
    audio: 'Audio',
    video: 'Video',
    text: 'Text',
    input: 'Input',
    output: 'Output',
    pleaseAddParams: 'Please right-click the node to pick variables',

    // 应用市场
    market: 'App Market',
    myApps: 'My Apps',
    exploreMarketApps: 'Explore rich AI app market, discover quality tools and solutions',
    tryOtherKeywords: 'Try other keywords',
    marketEmptyDescription: 'No apps available, please check back later',
    filteredResults: 'Filtered results: {count}',
    totalDownloads: 'Total downloads: {count}',
    appAlreadyInstalled: 'App already installed',
    appAlreadyInstalledConfirm: 'App "{name}" is already installed, overwrite?',
    installSuccess: 'App "{name}" installed successfully',
    installFailed: 'Installation failed',
    previewNotAvailable: 'Preview not available',
    appsOnline: 'apps online',
    searchApps: 'Search app name or type...',
    searchHistory: 'Search History',
    noSearchHistory: 'No search history',
    searchHistoryTip: 'Search history will appear here after you start searching',
    searchSuggestions: 'Search Suggestions',
    clearAllHistory: 'Clear All History',
    foundResults: 'Found {count} matching results',
    totalApps: 'Total {count} apps',
    category: 'Category:',

    // 应用创建和管理
    createApp: 'Create App',
    addNewApp: 'Add New App',
    createNew: 'Create New',
    importApp: 'Import App',
    editSourceCode: 'Edit Source Code',
    rebuild: 'Rebuild',
    launchApp: 'Launch App',
    createdOn: 'Created on {date}',
    workflowEditor: 'Edit Workflow',
    sourceCode: 'Source Code',
    appBuilding: 'App Building',
    waitingAIResponse: 'Waiting for AI response...',
    aiBuilding: 'AI is working hard to build...',
    aiBuild: 'AI Build',
    localBuild: 'Local Build',
    backToStyle: 'Back to Style Selection',
    startBuild: 'Start Build',
    stopBuilding: 'Stop Building',
    rebuildApp: 'Rebuild',
    saveApp: 'Save',
    pleaseEnterAppName: 'Please enter app name',
    pleaseEnterAppDescription: 'Please enter app description',
    pleaseUploadWorkflow: 'Please upload workflow',
    currentAppCodeExists: 'Current app code exists, regenerate?',
    rebuildAppTip: 'Regenerating the app will overwrite current code',
    buildApp: 'Build App',
    appNotBuilt: 'Current app is not built, build it first? Building may take a few minutes',
    pleaseEnterCode: 'Please enter code',
    rateLimitExceeded: 'Request rate limit exceeded, please try again later',
    rateLimitWaitMinutes: 'Request rate limit exceeded, please try again in {minutes} minutes',
    generationStopped: 'Generation stopped',
    aiResponseSuccess: 'AI response successful',
    processingResponseFailed: 'Processing response failed',
    aiResponseError: 'AI response error',
    aiRequestFailed: 'AI request failed',
    noAppsFound: 'No matching apps found',
    noAppsAvailable: 'No AI apps available',
    noAppsFoundWithQuery: 'No apps found containing "{query}", please try other keywords',
    noAppsInCategory: 'No apps found in "{category}" category',
    addFirstAppTip: 'Click the "Add New App" button in the top left to add your first AI app, or install apps from the app market',
    clearSearch: 'Clear Search',
    clearFilter: 'Clear Filter',
    editApp: 'Edit App',
    pleaseSetApiKey: 'Please set API Key',

    // 视图模式
    gridView: 'Grid View',
    compactView: 'Compact View',
    viewDetail: 'View Detail',
    nodes: 'Nodes',
    fromMarket: 'From Market',
    addNewAppTitle: 'Add New App',
    appName: 'App Name',
    appNamePlaceholder: 'Enter app name',
    appDescription: 'App Description',
    appDescriptionPlaceholder: 'Enter app description',
    coverImageUrl: 'Cover Image',
    uploadImage: 'Upload Image',
    coverImageUrlPlaceholder: 'https://example.com/imageUrl.jpg',
    appCategory: 'App Category',
    workflow: 'Workflow',
    editWorkflow: 'Edit Workflow',
    exportWorkflow: 'Export Workflow',
    uploadWorkflow: 'Upload Workflow',
    reuploadWorkflow: 'Re-upload',
    imageGeneration: 'Image Generation',
    videoGeneration: 'Video Generation',
    textProcessing: 'Text Processing',
    speechRecognition: 'Speech Recognition',
    dataAnalysis: 'Data Analysis',
    intelligentAssistant: 'Intelligent Assistant',
    app: 'App',
    center: ' Center',
    missingWorkflow: 'Missing workflow, please upload workflow first',
    runWorkflow: 'Run Workflow',
    batchMode: 'Batch Mode',
    batchModeDescription: 'Batch process data to improve work efficiency',
    selectSource: 'Select Source',
    selectSourceDesc: 'Select the source of batch data',
    mapData: 'Map Data',
    mapDataDesc: 'Map data fields to app inputs',
    execute: 'Execute',
    executeDesc: 'Execute batch processing tasks',
    selectBatchSource: 'Select Batch Data Source',
    fileDirectory: 'File Directory',
    uploadFile: 'Upload File',
    writeJSON: 'Write JSON',
    selectDirectory: 'Select Directory',
    directoryPathPlaceholder: 'Please select a directory containing files',
    browse: 'Browse',
    foundFiles: 'Found Files',
    all: 'All',
    filesOnly: 'Files Only',
    directoriesOnly: 'Directories Only',
    imagesOnly: 'Images Only',
    videosOnly: 'Videos Only',
    audiosOnly: 'Audios Only',
    textsOnly: 'Texts Only',
    documentsOnly: 'Documents Only',
    andMoreFiles: 'and {count} more files...',
    supportedFormats: 'Supported Formats',
    inputJSON: 'Input JSON',
    jsonFormatHint: 'Please enter valid JSON array format, each object represents a data item',
    dataPreview: 'Data Preview',
    items: 'items',
    andMoreItems: 'and {count} more items...',
    mapDataFields: 'Map Data Fields',
    availableData: 'Available Data',
    targetInputs: 'Target Inputs',
    dragFieldHere: 'Drag field here',
    executeBatchProcessing: 'Execute Batch Processing',
    batchSize: 'Batch Size',
    concurrentLimit: 'Concurrent Limit',
    executionPreview: 'Execution Preview',
    totalItems: 'Total Items',
    mappedFields: 'Mapped Fields',
    estimatedTime: 'Estimated Time',
    estimatedRemaining: 'Estimated Remaining Time',
    startBatchExecution: 'Start Batch Execution',
    previous: 'Previous',
    next: 'Next',
    minutes: 'minutes',
    seconds: 'seconds',
    lessThanOneSecond: '<1s',
    dayUnit: 'd',
    hourUnit: 'h',
    minuteUnit: 'm',
    secondUnit: 's',
    timeUnitSeparator: ' ',
    electronNotAvailable: 'Electron environment not available',
    selectDirectoryFailed: 'Failed to select directory',
    scanDirectoryFailed: 'Failed to scan directory',
    unsupportedFileType: 'Unsupported file type',
    fileTooLarge: 'File too large, please select a file smaller than 10MB',
    fileProcessingFailed: 'File processing failed',
    excelFileEmpty: 'Excel file is empty, please check file content',
    excelNoValidData: 'No valid data found in Excel file',
    excelParseFailed: 'Excel file parsing failed',
    excelFileReadFailed: 'Excel file reading failed',
    excelFileParsedSuccessfully: 'Excel file parsed successfully',
    invalidDataFormat: 'Invalid data format',
    fileParseFailed: 'File parsing failed',
    fileParsedSuccessfully: 'File parsed successfully',
    noDataToProcess: 'No data to process',
    noMappedFields: 'No mapped fields',
    batchExecutionStarted: 'Batch execution started',
    batchExecutionFailed: 'Batch execution failed',
    executionSettings: 'Execution Settings',
    startFromItem: 'Start from Item',
    startFromItemPlaceholder: 'Enter start position',
    startFromItemHint: 'Start from item 1, maximum is total items',
    executionProgress: 'Execution Progress',
    processed: 'Processed',
    total: 'Total',
    currentItem: 'Current Item',
    executionLogs: 'Execution Logs',
    clearLogs: 'Clear Logs',
    stopExecution: 'Stop Execution',
    executionStopped: 'Execution stopped',
    executionStoppedByUser: 'Execution stopped by user',
    stopExecutionFailed: 'Failed to stop execution',
    itemProcessedSuccessfully: 'Item {index} processed successfully',
    itemProcessingFailed: 'Item {index} processing failed',
    batchExecutionCompleted: 'Batch execution completed, processed {total} items, {success} successful, {failed} failed',
    openOutputDirectory: 'Open Output Directory',
    outputDirectoryOpened: 'Output directory opened',
    openOutputDirectoryFailed: 'Failed to open output directory',
    selectFile: 'Select File',
    dragTip: 'Drag fields from the left to the right input box for mapping',

    // 错误消息
    cannotReadWorkflowInfo: 'Cannot read workflow info',
    appParseError: 'App parse error',
    workflowSaveFailed: 'Workflow save failed: {error}',
    pleaseBuildAppFirst: 'Please build app first',
    importSuccess: 'Successfully imported {count} apps',
    noValidAppsFound: 'No valid app data found',
    onlyJsonFilesAllowed: 'Only JSON files are allowed',

    // 通用错误提示
    serverError: 'Server error',
    unknownError: 'Unknown error',
    operationFailed: 'Operation failed',
    saveFailed: 'Save failed',
    uploadFailed: 'Upload failed',
    validationError: 'Validation error',
    permissionDenied: 'Permission denied',
    timeoutError: 'Request timeout',
    invalidInput: 'Invalid input',
    fileNotFound: 'File not found',
    dataNotFound: 'Data not found',
    connectionFailed: 'Connection failed',

    // 应用相关错误提示
    configLoadFailed: 'Configuration load failed',
    configSaveFailed: 'Configuration save failed',
    appsLoadFailed: 'Apps list load failed',
    addAppFailed: 'Add app failed',
    removeAppFailed: 'Remove app failed',
    updateAppFailed: 'Update app failed',
    importAppsFailed: 'Import apps failed',
    getAppFailed: 'Get app failed',
    buildStylesLoadFailed: 'App styles load failed',

    // 其他功能
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    professional: 'Professional',
    mainFeatures: 'Main Features',
    advancedNLP: 'Advanced Natural Language Processing capabilities',
    multimodalData: 'Multimodal data understanding and analysis',
    realtimeResponse: 'Real-time response and intelligent decision making',
    confirmDelete: 'Confirm Delete',

    // 404页面
    pageNotFound: 'Page Not Found',
    pageNotFoundDescription: 'Sorry, the page you are looking for does not exist or has been moved.',
    goBack: 'Go Back',
    youCanTry: 'You can try:',
    checkUrlSpelling: 'Check if the URL spelling is correct',
    useNavigationMenu: 'Use the navigation menu to browse other pages',
    contactAdmin: 'Contact administrator for help',

    // AI编辑功能
    aiEdit: 'AI Edit',
    aiEditPlaceholder: 'Enter what you want to modify in the page, e.g. "Change the color scheme to a light color scheme, change the button to a rounded button"',
    aiEditTip: 'Enter what you want to modify in the page, e.g. "Change the color scheme to a light color scheme, change the button to a rounded button"',
    aiEditStop: 'Stop',
    aiEditRunning: 'AI is editing...',
    aiEditSuccess: 'AI edit succeeded',
    aiEditFailed: 'AI edit failed',

    // 优化提示词
    optimizePrompt: 'Optimize Prompt',
    optimizePromptConfirm: 'Use AI to optimize the current prompt. The result will overwrite your current input. Continue?',

    // 删除确认
    deleteApp: 'Delete App',
    deleteAppConfirm: 'Are you sure you want to delete app {name}?',

    // 评分和创建时间
    rating: 'Rating',

    // 刷新相关
    refreshFailed: 'Refresh iframe failed',
    aiWorkingEnd: 'AI work ended, update preview content',

    // 通用状态
    success: 'Success',
    failed: 'Failed',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    startFromItemLabel: 'Start from item:',
    currentProcessingLabel: 'Current processing:',

    // 更新相关
    checkForUpdates: 'Check for Updates',
    checkingForUpdates: 'Checking for updates...',
    updateAvailable: 'Update Available',
    downloadingUpdate: 'Downloading update...',
    updateDownloaded: 'Update downloaded',
    alreadyLatestVersion: 'Already latest version',
    currentVersion: 'Current version',
    newVersion: 'New version',
    downloadUpdate: 'Download Update',
    installUpdate: 'Restart and Install',
    restartAndInstall: 'Restart and Install',
    checkUpdateFailed: 'Failed to check for updates',
    downloadUpdateFailed: 'Failed to download update',
    installUpdateFailed: 'Failed to install update',
    checking: 'Checking...',
    later: 'Later',
    laterRestart: 'Restart Later',
    autoUpdate: 'Auto Update',
    updateInProgress: 'Update in progress',
    pleaseWait: 'Please wait',
    clickToRestart: 'Click the button below to restart the app and install the update',
    versionAvailable: 'Version {version} is available',
    checkingForNewVersion: 'Checking for new version availability',
    downloadingNewVersion: 'Downloading new version, please wait',
    currentVersionIsLatest: 'Current version {version} is already the latest',
    updateCheckError: 'Failed to check for updates',
    updateDownloadError: 'Failed to download update',
    updateInstallError: 'Failed to install update',

    // 提示消息
    updateAvailableMessage: 'New version {version} is available for download',
    noUpdateAvailableMessage: 'You are already using the latest version',
    updateDownloadedMessage: 'Update downloaded successfully, ready to restart and install',
    updateCheckFailedMessage: 'Failed to check for updates, please try again later',
    updateDownloadFailedMessage: 'Failed to download update, please check your network connection',
    updateInstallFailedMessage: 'Failed to install update, please try again later',

    // 手动更新相关
    manualUpdateTip: 'If automatic update fails, you can manually download the latest version',
    manualUpdateAvailable: 'You can also manually check GitHub releases for the latest version',
    downloadFromGitHub: 'Download from GitHub',
    checkGitHubReleases: 'Check GitHub Releases',
    manualDownload: 'Manual Download',
    confirmManualDownload: 'About to open GitHub releases page where you can download the latest version. Continue?',
    openingGitHubMessage: 'Opening GitHub releases page...',
    manualDownloadError: 'Failed to open GitHub page, please manually visit the releases page'
  }
}

// 获取翻译文本 - 重构后的版本，不需要传递lang参数
export function t(key, params = {}) {
  const lang = currentLang.value
  const keys = key.split('.')
  let value = translations[lang] || translations.zh

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // 如果找不到翻译，返回key本身
      return key
    }
  }

  let result = value || key

  // 替换参数
  if (typeof result === 'string' && Object.keys(params).length > 0) {
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param])
    })
  }

  return result
}

// 兼容旧版本的t函数，支持传递lang参数
export function tWithLang(key, lang = 'zh', params = {}) {
  const keys = key.split('.')
  let value = translations[lang] || translations.zh

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // 如果找不到翻译，返回key本身
      return key
    }
  }

  let result = value || key

  // 替换参数
  if (typeof result === 'string' && Object.keys(params).length > 0) {
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param])
    })
  }

  return result
}

// 根据语言获取翻译对象
export function getTranslations(lang = 'zh') {
  return translations[lang] || translations.zh
}

// 创建i18n composable
export function useI18n() {
  return {
    t,
    setLanguage,
    getCurrentLanguage,
    currentLang: computed(() => currentLang.value)
  }
}

// 在子组件中使用的i18n composable
export function useI18nInComponent() {
  const i18n = inject('i18n')
  if (!i18n) {
    console.warn('i18n not provided, falling back to global i18n')
    return useI18n()
  }
  return i18n
}

export default {
  t,
  tWithLang,
  getTranslations,
  setLanguage,
  getCurrentLanguage,
  useI18n,
  useI18nInComponent
}
