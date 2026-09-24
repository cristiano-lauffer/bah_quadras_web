import { useState } from "react";
import "./App.css";

function App() {
  const [tela, setTela] = useState("login");

  return (
    <div className="container">
      <div className="card">
        <h1>BAH QUADRAS</h1>

        {tela === "login" ? (
          <>
            <h2>Entrar</h2>

            <input
              type="email"
              placeholder="E-mail"
            />

            <input
              type="password"
              placeholder="Senha"
            />

            <button>Entrar</button>

            <p>
              Ainda não tem uma conta?
              <span onClick={() => setTela("cadastro")}>
                {" "}Cadastre-se
              </span>
            </p>
          </>
        ) : (
          <>
            <h2>Cadastro</h2>

            <input
              type="text"
              placeholder="Nome"
            />

            <input
              type="email"
              placeholder="E-mail"
            />

            <input
              type="password"
              placeholder="Senha"
            />

            <input
              type="password"
              placeholder="Confirmar senha"
            />

            <button>Cadastrar</button>

            <p>
              Já possui uma conta?
              <span onClick={() => setTela("login")}>
                {" "}Entrar
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;