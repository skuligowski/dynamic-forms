import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);

  const formMetadata = {
    "components": [
      {
        "id": "isComment",
        "type": "checkbox",
        "label": "Yes, I want to comment",
      },
      {
        "id": "isConfirm",
        "type": "checkbox",
        "label": "Yes, I confirm to write only the thuth",
        "disabled": "!isComment"
      },
      {
        "id": "comment",
        "type": "textarea",
        "label": "My comment",
        "disabled": "!isComment || !isConfirm"
      },
    ]
  };

  console.log(formMetadata);
  
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
