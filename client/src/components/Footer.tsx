import useCart from "../hooks/useCart";

const Footer = () => {
  const { totalItems, totalPrice } = useCart();

  const year: number = new Date().getFullYear();

  const pageContent = (
    <>
      <p>Total Items: {totalItems}</p>
      <p>Total Price: {totalPrice}</p>
      <p>Vacuum Depot &copy;{year}</p>
    </>
  );

  const content = <footer className="footer">{pageContent}</footer>;

  return content;
};

export default Footer;
