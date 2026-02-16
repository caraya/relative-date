
import { TimeAgo } from './TimeAgo'
import './App.css'

function App() {


  return (
    <>
      <div>
        <h1>TimeAgo Demo</h1>


        <h2>Default values, just date</h2>
        <TimeAgo date="2025-12-09" />

        <h2>Custom locale (English, UK)</h2>
        <TimeAgo date="2025-12-09" locale="en-GB" />

        <h2>Custom locale (Spanish)</h2>
        <TimeAgo date="2025-12-09" locale="es-ES" />

        <h2>Custom locale (Spanish,  Chile)</h2>
        <TimeAgo date="2025-12-09" locale="es-CL" />

        <h2>Custom locale (French)</h2>
        <TimeAgo date="2025-12-09" locale="fr-FR" />

        <h2>Custom locale (Japanese)</h2>
        <TimeAgo date="2025-12-09" locale="ja-JP" />
        
        <h2>Longer date</h2>
        <TimeAgo date="2020-01-01" />

        <h2>Future date</h2>
        <p>It displays <code>now</code>, regardless of the future date</p>
        <TimeAgo date="2030-01-01" />

        <h2>Future date (Spanish)</h2>
        <p>It displays <code>ahora</code>, regardless of the future date</p>
        <TimeAgo date="2030-01-01" locale="es-ES" />

        <h2>Invalid date</h2>
        <TimeAgo date="invalid-date" errorFallback="This is not a valid date" />
      </div>



    </>
  )
}

export default App
