import React, { useState } from 'react'

export default function SecretManager() {
  const [subId, setSubId] = useState('')
  const [result, setResult] = useState(null)

  const validate = async () => {
    const res = await fetch(`/api/integrations/webhooks/subscriptions/${subId}/validate_secret/`, { method: 'POST' })
    const j = await res.json()
    setResult({ status: res.status, body: j })
  }

  return (
    <div>
      <h3>Secret Manager</h3>
      <input placeholder="Webhook Subscription ID" value={subId} onChange={(e) => setSubId(e.target.value)} />
      <button onClick={validate}>Validate Secret</button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}
