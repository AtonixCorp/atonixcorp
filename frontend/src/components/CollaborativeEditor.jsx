import React, { useEffect, useRef, useState } from 'react'

export default function CollaborativeEditor({ docId }) {
  const [content, setContent] = useState('')
  const editorRef = useRef(null)

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/docs/${docId}/`)
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'doc.update') {
        setContent(msg.content)
      }
    }
    return () => socket.close()
  }, [docId])

  const onInput = () => {
    const newContent = editorRef.current.innerText
    setContent(newContent)
    // send update
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/docs/${docId}/`)
    socket.onopen = () => socket.send(JSON.stringify({ type: 'doc.update', content: newContent }))
  }

  return (
    <div>
      <div ref={editorRef} contentEditable onInput={onInput} style={{ border: '1px solid #ccc', padding: 10, minHeight: 200 }}>
        {content}
      </div>
    </div>
  )
}
