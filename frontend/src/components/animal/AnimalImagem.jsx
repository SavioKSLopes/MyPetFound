import { useState } from "react";
import { normalizarUrlImagem } from "../../utils/imagem.js";
import "./animal.css";

function AnimalImagem({
  src,
  nome,
  className = "",
  imageClassName = "",
  placeholderClassName = "",
  alt,
  objectFit = "contain",
  variant = "padrao",
  children,
}) {
  const [urlComFalha, setUrlComFalha] = useState("");
  const url = normalizarUrlImagem(src);
  const imagemDisponivel = Boolean(url && urlComFalha !== url);

  const altText = alt || (nome ? `Foto de ${nome}` : "Foto de animal não identificado");

  return (
    <div className={`animal-imagem animal-imagem--${variant} ${className}`.trim()}>
      {imagemDisponivel ? (
        <img
          className={imageClassName || undefined}
          src={url}
          alt={altText}
          style={variant === "card" ? undefined : { objectFit }}
          onError={(event) => {
            console.error("Falha ao carregar foto do animal:", event.currentTarget.src);
            setUrlComFalha(url);
          }}
        />
      ) : (
        <div
          className={`animal-imagem-placeholder ${placeholderClassName}`.trim()}
          role="img"
          aria-label={nome ? `Foto indisponível de ${nome}` : "Foto indisponível de animal não identificado"}
        >
          🐾
        </div>
      )}
      {children}
    </div>
  );
}

export default AnimalImagem;
