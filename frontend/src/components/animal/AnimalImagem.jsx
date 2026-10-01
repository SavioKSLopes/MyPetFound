import "./animal.css";

function AnimalImagem({
  src,
  nome,
  className = "",
  imageClassName = "",
  placeholderClassName = "",
  alt,
  children,
}) {
  return (
    <div className={className}>
      {src ? (
        <img
          className={imageClassName || undefined}
          src={src}
          alt={alt || `Foto de ${nome || "animal"}`}
        />
      ) : (
        <span
          className={placeholderClassName || undefined}
          aria-hidden="true"
        >
          🐾
        </span>
      )}
      {children}
    </div>
  );
}

export default AnimalImagem;
