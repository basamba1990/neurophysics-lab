import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Copy, CheckCircle } from 'lucide-react'

const CodeEditor = ({ 
  code, 
  onCodeChange, 
  language = 'python',
  onRun = null,
  readOnly = false 
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Editor Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {language.toUpperCase()}
        </span>
        
        <div className="flex space-x-2">
          {onRun && (
            <button
              onClick={onRun}
              className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Exécuter
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copié!' : 'Copier'}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={onCodeChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on'
        }}
        theme="vs-light"
      />
    </div>
  )
}

export default CodeEditor
