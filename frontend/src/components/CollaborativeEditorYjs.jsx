import React, { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CodemirrorBinding } from 'y-codemirror'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

export default function CollaborativeEditorYjs({ docId }) {
  const editorRef = useRef(null)

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://localhost:1234', docId, ydoc)
    const yText = ydoc.getText('codemirror')

    const cm = CodeMirror(editorRef.current, { mode: 'markdown', lineNumbers: true })
    const binding = new CodemirrorBinding(yText, cm, provider.awareness)

    return () => {
      binding.destroy()
      provider.disconnect()
      ydoc.destroy()
    }
  }, [docId])

  return <div ref={editorRef} style={{ minHeight: 400 }} />
}
