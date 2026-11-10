// Utilitários da camada de serviços de demonstração.
// Enquanto não há backend, os dados ficam no localStorage do navegador.
// Se o localStorage estiver bloqueado (aba anônima, por exemplo), tudo segue
// funcionando só em memória até recarregar a página.

const memoria = new Map();

export function lerSalvo(chave) {
  if (memoria.has(chave)) return memoria.get(chave);
  try {
    const texto = localStorage.getItem(chave);
    if (texto) {
      const valor = JSON.parse(texto);
      memoria.set(chave, valor);
      return valor;
    }
  } catch {
    /* sem acesso ao localStorage: usa só a memória */
  }
  return undefined;
}

export function salvar(chave, valor) {
  memoria.set(chave, valor);
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem acesso ao localStorage: usa só a memória */
  }
}

export function apagar(chave) {
  memoria.delete(chave);
  try {
    localStorage.removeItem(chave);
  } catch {
    /* ignora */
  }
}

// Simula a latência de uma API e devolve uma cópia (como uma resposta HTTP faria).
export const responder = (valor, espera = 250) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(valor)), espera));

export const falhar = (mensagem, espera = 250) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(mensagem)), espera));
