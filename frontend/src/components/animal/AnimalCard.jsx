import "./animal.css";

function AnimalCard({ animal, children, variant = "padrao", className = "" }) {
  return (
    <article
      className={`animal-card animal-card-${variant} ${className}`.trim()}
      data-animal-id={animal?.id}
    >
      {children}
    </article>
  );
}

export default AnimalCard;
