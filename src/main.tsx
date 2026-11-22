import {createRoot} from 'react-dom/client'
import {App} from './App'
import {WebKit} from './kit'
import './styles.css'
createRoot(document.getElementById('root')!).render(<WebKit><App/></WebKit>)
