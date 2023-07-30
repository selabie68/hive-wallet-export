import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'

import HomePage from './pages/Home'

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
      (localStorage.getItem('theme') !== 'light' &&
        matchMedia('(prefers-color-scheme: dark)').matches),
  )

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <HomePage setDarkMode={setDarkMode} darkMode={darkMode} />
    </ConfigProvider>
  )
}

export default App
