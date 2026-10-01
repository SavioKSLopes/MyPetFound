import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";


function RotaProtegida() {
  const localizacao = useLocation();

  const { temToken } = useAuth();

  if (!temToken) {
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
