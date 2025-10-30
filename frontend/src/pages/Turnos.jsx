import { useMemo } from "react";
import TurnosGrid from "../components/TurnosGrid";
import useAuthStore from "../store/useAuthStore";

export default function Turnos({ loggedInProfesionalId: overrideProfesionalId }) {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  const loggedInProfesionalId = useMemo(() => {
    if (overrideProfesionalId !== undefined && overrideProfesionalId !== null) {
      return overrideProfesionalId;
    }
    if (profile?.id_profesional) {
      return profile.id_profesional;
    }
    if (user?.id_profesional) {
      return user.id_profesional;
    }
    if (user?.id) {
      return user.id;
    }
    return null;
  }, [overrideProfesionalId, profile?.id_profesional, user?.id_profesional, user?.id]);

  return (
    <div className="turnos-page">
      <TurnosGrid loggedInProfesionalId={loggedInProfesionalId} />
    </div>
  );
}
