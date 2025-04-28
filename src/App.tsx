import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './general-components/Menu';
import Home from './layouts/home/Home';
import ChatBot from './layouts/chatBot/ChatBot';

function App() {
  return (
    <>
      <Router>
        <Menu/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
