import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button aria-pressed={dark} onClick={() => setDark((d) => !d)}>
      {dark ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  )
}
