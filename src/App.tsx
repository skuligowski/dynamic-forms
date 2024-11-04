import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);

  const formMetadata = {
    "conditions": [
      { "name": "escalationSelected", "type": "value", "component": "escalateCheckbox", "value": true },
      { "name": "hasEscalationComment", "type": "notEmpty", "component": "escalationComment" },
    ],
    "components": [
      {
        "id": "escalateCheckbox",
        "type": "checkbox",
        "label": "Yes, I want to escalate",
        "dependencies": []
      },
      {
        "id": "escalationComment",
        "type": "textarea",
        "label": "Escalation comment",
        "dependencies": [
          { "type": "enable", "expression": "escalationSelected" }
        ]
      },
      {
        "id": "escalateAction",
        "type": "action",
        "label": "Escalate",
        "dependencies": [
          { "type": "enable", "expression": "escalationSelected & hasEscalationComment" }
        ]
      }
    ]
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
