# 电影宇宙视觉升级设计

## 目标

在现有 Personal Cosmos 的滚动叙事、NASA 素材和项目目录基础上，采用“电影感骨架 + React Bits 局部高能效果”的 C 方案。首要验收点是星点不再呈方块，其次是四个天体有可辨识的材质层次和项目身份，同时中文信息保持短、清楚、可操作。

## 视觉原则

- 远景星点使用圆形距离场（`gl_PointCoord`）而不是 `PointsMaterial` 默认方点；仅少量近景导航星使用十字星芒。
- 银河粒子使用冷蓝、紫、橙三组低饱和颜色，靠半径和透明度形成旋臂，不使用满屏强发光。
- 行星保留 NASA/JPL 纹理作为表面事实来源，新增 Fresnel 边缘大气、细微明暗层和按项目配色的环/标记；不把行星替换为卡通几何。
- 恒星使用柔和核心和薄日冕，不产生刺眼太阳效果。
- 信息面板只在停靠点出现：一句“这里是什么”、一句“你能做什么”，唯一主动作保持明确。

## 实现边界

- 不新增 React Bits 运行时依赖；只复刻适合当前 Three.js 管线的局部渲染思路。
- `activeBudget` 继续控制粒子数、亮星数、光晕和装饰密度；移动端与 reduced-motion 不渲染高成本装饰。
- 无 WebGL fallback、滚动停靠、项目目录、Reader 和现有 URL 不改变。
- 所有视觉函数先有可执行测试，再写生产实现。

## 模块设计

### 1. 圆形星点层

抽出 `src/three/particleVisuals.js`，提供可复用的星点 vertex/fragment shader 字符串和 `starBudgetForCount(count)`。`DeepSpace` 使用两层粒子：大量微星和少量亮星。fragment shader 对圆外像素 `discard`，亮星额外用两条指数衰减的轴向光线形成小十字星芒。

### 2. 银河粒子层

`PersonalGalaxy` 改用同一套圆形粒子 shader，增加 `aRadius` 和 `aSeed` 以便中心更亮、外围更轻；通过现有 `galaxyTransformForProgress` 继续完成滚动缩放。银河核心添加低透明径向圆盘，避免粒子堆成一团白雾。

### 3. 行星材质层

`CelestialBody` 保留纹理球体，叠加轻量 Fresnel atmosphere shell。高质量档位启用 atmosphere 和 focused rim，低质量档位只保留纹理球。`StellarSystem` 的恒星改为核心球 + 两层透明光晕，并用项目 accent 给轨道和信息面板统一色彩。

### 4. 信息层与文字

更新 `Hud`、`ObserverIntro`、`ProjectDirectory` 的停靠文案：减少玄学词，直接说明“继续滚动”“点按行星”“打开项目”。项目标签和 system caption 提高对比度、间距和字号；不添加重复的 3D 大标题。

## 验收

- 单元测试覆盖 `starBudgetForCount`、shader 的圆形 discard/星芒分支、低质量预算关闭 atmosphere。
- 生产构建、lint、全量测试通过。
- 浏览器截图确认 1280×720 和 390×844 中星点为圆形，银河层次可见，行星有边缘光且文字清晰；控制台无应用错误。
