import React, { useState } from 'react'

export default function SSOConfig() {
  const [provider, setProvider] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  const save = async () => {
    const res = await fetch('/api/integrations/sso/configure/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, clientId, clientSecret }),
    })
    if (res.ok) alert('Saved')
  }

  return (
    <div>
      <h3>SSO Configuration</h3>
      <select value={provider} onChange={(e) => setProvider(e.target.value)}>
        <option value="">Select provider</option>
        <option value="okta">Okta</option>
        <option value="azure">Azure AD</option>
        <option value="google">Google Workspace</option>
      </select>
      <div>
        <input placeholder="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
      </div>
      <div>
        <input placeholder="Client Secret" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
      </div>
      <button onClick={save}>Save</button>
    </div>
  )
}
