import React from 'react';
import TurnosGrid from '../components/TurnosGrid';

export default function Turnos({ loggedInProfesionalId }) {
  return (
    <div>
      <TurnosGrid loggedInProfesionalId={loggedInProfesionalId} />
    </div>
  );
}
