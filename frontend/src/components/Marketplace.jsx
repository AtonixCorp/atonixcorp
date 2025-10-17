import React, { useEffect, useState } from 'react'

export default function Marketplace() {
  const [apps, setApps] = useState([])

  useEffect(() => {
    fetch('/api/integrations/marketplace/').then((r) => r.json()).then(setApps)
  }, [])

  const install = (slug) => {
    // placeholder: call API to enable/install
    alert('Install ' + slug)
  }

  return (
    <div>
      <h3>Marketplace</h3>
      <ul>
        {apps.map((a) => (
          <li key={a.id}>
            <img src={a.logo_url} alt="logo" width={48} height={48} />
            <strong>{a.name}</strong>
            <p>{a.description}</p>
            <button onClick={() => install(a.slug)}>Install</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
