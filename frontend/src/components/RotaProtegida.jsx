import { Navigate, Outlet, useLocation } from "react-router-dom";


function RotaProtegida() {
  const localizacao = useLocation();

  const token = localStorage.getItem("mypetfound_token");

  if (!token) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{
          de: localizacao.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default RotaProtegida;