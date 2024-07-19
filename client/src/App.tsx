import { Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';

const App = () => {
  const content = (
    <>
      <Navbar />
      <>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/home" element={<Home />} />

          <Route path="/signup" element={<SignUp />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    </>
  );
  return content;
};

export default App;
