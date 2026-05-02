import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Series } from './pages/Series';
import { SeriesDetail } from './pages/SeriesDetail';
import { Exhibitions } from './pages/Exhibitions';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/series" element={<Series />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
