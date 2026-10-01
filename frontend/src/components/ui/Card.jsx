import "./ui.css";

function Card({ children, className = "", as: Elemento = "div", ...props }) {
  return (
    <Elemento {...props} className={`card-ui ${className}`.trim()}>
      {children}
    </Elemento>
  );
}

export default Card;
