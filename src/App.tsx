import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import BlockDetails from './pages/BlockDetails/BlockDetails';
import TransactionDetails from './pages/TransactionDetails/TransactionDetails';
import AddressDetails from './pages/AddressDetails/AddressDetails';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/block/:blockId" element={<BlockDetails />} />
            <Route path="/tx/:txId" element={<TransactionDetails />} />
            <Route path="/address/:address" element={<AddressDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
