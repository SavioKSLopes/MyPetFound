import { formatarDataHora } from "../../utils/formatadores.js";
import Botao from "../ui/Botao";
import "./mensagens.css";

function MensagemCard({ mensagem, onMarcarComoLida, marcandoComoLida = false }) {
  return (
    <article
      className={`card-mensagem${mensagem.lida ? "" : " card-mensagem-nova"}`}
    >
      <div className="cabecalho-card-mensagem">
        <div>
          <p className="animal-mensagem">{mensagem.animal_nome}</p>
          <time dateTime={mensagem.criada_em}>
            {formatarDataHora(mensagem.criada_em)}
          </time>
        </div>
        <span
          className={
            mensagem.lida
              ? "status-mensagem status-mensagem-lida"
              : "status-mensagem status-mensagem-nova"
          }
        >
          {mensagem.lida ? "Lida" : "Nova"}
        </span>
      </div>

      <p className="texto-mensagem">{mensagem.mensagem}</p>

      {mensagem.localizacao_texto && (
        <p className="localizacao-mensagem">
          <span aria-hidden="true">📍</span>
          {mensagem.localizacao_texto}
        </p>
      )}

      {!mensagem.lida && (
        <Botao
          type="button"
          onClick={() => onMarcarComoLida(mensagem.id)}
          disabled={marcandoComoLida}
        >
          {marcandoComoLida ? "Atualizando..." : "Marcar como lida"}
        </Botao>
      )}
    </article>
  );
}

export default MensagemCard;
