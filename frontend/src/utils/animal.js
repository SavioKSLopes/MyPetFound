export function obterCategoriaStatusAnimal(status, desaparecido = false) {
  const valor = String(status || "CADASTRADO").toUpperCase();

  if (
    desaparecido ||
    valor === "PERDIDO" ||
    valor === "DESAPARECIDO"
  ) {
    return "perdido";
  }

  if (valor === "ENCONTRADO" || valor === "REENCONTRADO") {
    return "positivo";
  }

  return "neutro";
}

export function animalEstaDesaparecido(animal = {}) {
  return obterCategoriaStatusAnimal(animal.status, animal.desaparecido) === "perdido";
}

export function obterNomeEspecie(animal = {}) {
  return animal.especie_nome || animal.especie;
}

export function obterNomePorte(animal = {}) {
  return animal.porte_nome || animal.porte;
}
