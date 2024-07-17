import Header from "../components/Header";
import Footer from "../components/Footer";
import Cart from "../components/Cart";
import ProductList from "../components/ProductList";
import { useState } from "react";
import Navbar from "../components/Navbar";

const Home = () => {
  const [viewCart, setViewCart] = useState<boolean>(false);
  const pageContent = viewCart ? <Cart /> : <ProductList />;
  const content = (
    <>
      {/* <Navbar /> */}
      <Header viewCart={viewCart} setViewCart={setViewCart} />

      {pageContent}
      <Footer viewCart={viewCart} />
    </>
  );
  return content;
};

export default Home;
