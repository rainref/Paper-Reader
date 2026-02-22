import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Library from './pages/Library'
import PaperView from './pages/PaperView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/paper/:id" element={<PaperView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
