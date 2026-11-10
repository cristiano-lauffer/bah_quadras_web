import { useCallback, useEffect, useState } from "react";

/**
 * Carrega dados assíncronos (de um serviço ou da API) e controla o estado de carregamento.
 *
 *   const { dados, carregando, erro, recarregar } = useDados(() => buscarQuadra(id), [id]);
 */
export function useDados(carregar, dependencias = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    carregar()
      .then((dados) => ativo && setEstado({ dados, carregando: false, erro: null }))
      .catch((erro) => ativo && setEstado({ dados: null, carregando: false, erro }));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { ...estado, recarregar };
}
