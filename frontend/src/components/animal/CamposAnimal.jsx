import CampoFormulario from "../ui/CampoFormulario";
import CampoSelect from "../ui/CampoSelect";
import CampoTextarea from "../ui/CampoTextarea";

function CamposAnimal({ valores, aoAlterar, modo = "cadastro" }) {
  const edicao = modo === "edicao";
  const prefixo = `animal-${modo}`;
  const classes = edicao ? "campos-editar-animal" : "grid-campos-animal";
  const classesLargos = edicao
    ? "campo-largo-editar"
    : "campo-cadastro-animal campo-largo";
  const classesCampo = edicao ? "" : "campo-cadastro-animal";

  const nome = (
    <CampoFormulario
      key="nome"
      id={`${prefixo}-nome`}
      label={edicao ? "Nome" : "Nome do animal *"}
      className={classesLargos}
    >
      <input
        id={`${prefixo}-nome`}
        type="text"
        value={valores.nome}
        onChange={(event) => aoAlterar("nome", event.target.value)}
        placeholder="Ex.: Luna"
        maxLength="100"
        required
      />
    </CampoFormulario>
  );

  const especie = (
    <CampoSelect
      key="especie"
      id={`${prefixo}-especie`}
      label={edicao ? "Espécie" : "Espécie *"}
      className={classesCampo}
      value={valores.especie}
      onChange={(event) => aoAlterar("especie", event.target.value)}
      required
    >
      <option value="">Selecione</option>
      <option value="CACHORRO">Cachorro</option>
      <option value="GATO">Gato</option>
      <option value="OUTRO">Outro</option>
    </CampoSelect>
  );

  const raca = (
    <CampoFormulario
      key="raca"
      id={`${prefixo}-raca`}
      label="Raça"
      className={classesCampo}
    >
      <input
        id={`${prefixo}-raca`}
        type="text"
        value={valores.raca}
        onChange={(event) => aoAlterar("raca", event.target.value)}
        placeholder={edicao ? "Ex.: Siamês" : "Ex.: SRD, Poodle, Siamês"}
        maxLength="100"
      />
    </CampoFormulario>
  );

  const porte = (
    <CampoSelect
      key="porte"
      id={`${prefixo}-porte`}
      label={edicao ? "Porte" : "Porte *"}
      className={classesCampo}
      value={valores.porte}
      onChange={(event) => aoAlterar("porte", event.target.value)}
      required
    >
      <option value="">Selecione</option>
      <option value="PEQUENO">Pequeno</option>
      <option value="MEDIO">Médio</option>
      <option value="GRANDE">Grande</option>
    </CampoSelect>
  );

  const sexo = (
    <CampoSelect
      key="sexo"
      id={`${prefixo}-sexo`}
      label={edicao ? "Sexo *" : "Sexo *"}
      className={classesCampo}
      value={valores.sexo}
      onChange={(event) => aoAlterar("sexo", event.target.value)}
      required
    >
      <option value="M">Macho</option>
      <option value="F">Fêmea</option>
    </CampoSelect>
  );

  const cor = (
    <CampoFormulario
      key="cor"
      id={`${prefixo}-cor`}
      label={edicao ? "Cor predominante" : "Cor predominante *"}
      className={edicao ? classesLargos : classesCampo}
    >
      <input
        id={`${prefixo}-cor`}
        type="text"
        value={valores.cor}
        onChange={(event) => aoAlterar("cor", event.target.value)}
        placeholder={edicao ? "Ex.: Preto e branco" : "Ex.: Caramelo"}
        maxLength="100"
        required={!edicao}
      />
    </CampoFormulario>
  );

  const descricao = (
    <CampoTextarea
      key="descricao"
      id={`${prefixo}-descricao`}
      label={edicao ? "Características adicionais" : "Características e observações"}
      className={classesLargos}
      value={valores.descricao}
      onChange={(event) => aoAlterar("descricao", event.target.value)}
      placeholder={edicao ? "Ex.: Possui cicatriz nas costas." : "Ex.: Possui uma mancha branca no peito, usa coleira vermelha e é bastante dócil."}
      rows="5"
      {...(edicao ? { maxLength: 1000 } : {})}
    />
  );

  const campos = edicao
    ? [nome, especie, raca, porte, sexo, cor, descricao]
    : [nome, especie, porte, raca, sexo, cor, descricao];

  return <div className={classes}>{campos}</div>;
}

export default CamposAnimal;
