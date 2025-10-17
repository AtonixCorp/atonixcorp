import React, { useEffect, useState } from 'react'

export default function Chat({ roomId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${roomId}/`)
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'chat.message') {
        setMessages((m) => [...m, msg.message])
      }
    }
    return () => socket.close()
  }, [roomId])

  const send = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${roomId}/`)
    socket.onopen = () => socket.send(JSON.stringify({ text }))
    setText('')
  }

  return (
    <div>
      <div style={{ height: 300, overflow: 'auto' }}>
        {messages.map((m) => (
          <div key={m.id}><strong>{m.sender}</strong>: {m.text}</div>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  )
}
