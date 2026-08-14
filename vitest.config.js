import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const local = (p) => fileURLToPath(new URL(p, import.meta.url))

// 三维场景需要真实 WebGL，jsdom 里跑不起来。
// 所以测试覆盖的是数据、状态机和二维阅读层——这些正是内容出错时用户最先看到的地方。
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['three', 'react', 'react-dom'],
    // 测试工具可能带来第二份 React，会让 hooks 直接报错，这里锁定到项目自己的副本
    alias: {
      react: local('./node_modules/react'),
      'react-dom': local('./node_modules/react-dom'),
    },
  },
  // vitest 走的转换管线里 plugin-react 不生效，显式指定自动 JSX 运行时
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
})
