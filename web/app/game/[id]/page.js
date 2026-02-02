import React from 'react';
import GameClient from '../../components/GameClient';

export function generateStaticParams() {
  return [
    { id: 'slither' },
    { id: 'flappy' },
    { id: 'checkers' },
    { id: 'whot' },
    { id: 'cards' }
  ];
}

export default async function GamePage({ params }) {
  const { id } = await params;
  return <GameClient gameId={id} />;
}
