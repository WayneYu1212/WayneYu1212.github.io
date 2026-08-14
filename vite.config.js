import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 目标仓库为 WayneYu1212.github.io，静态资源从域名根路径加载。
  base: '/',
  // three 只允许存在一份，否则 drei 的依赖会带进第二个 three 实例
  resolve: { dedupe: ['three', 'react', 'react-dom'] },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
})
