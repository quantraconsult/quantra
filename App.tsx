
import React from 'react';
import Header from './components/Header';
import Hub from './components/Hub';

const App: React.FC = () => {
  return (
    <div className="bg-zinc-900 min-h-screen text-gray-200 antialiased">
      <Header />
      <Hub />
    </div>
  );
};

export default App;
