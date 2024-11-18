import React from 'react';
import { Link } from 'react-router-dom';
import { GamepadIcon, BrickWallIcon, BlocksIcon, SquareIcon } from 'lucide-react';

const Games = () => {
  const gamesList = [
    {
      name: 'Flappy Bird',
      path: '/flappybird',
      icon: <GamepadIcon className="w-10 h-10 text-blue-500" />
    },
    {
      name: 'Brick Breaker',
      path: '/brickbreaker',
      icon: <BrickWallIcon className="w-10 h-10 text-red-500" />
    },
    {
      name: 'Tetris',
      path: '/tetris',
      icon: <BlocksIcon className="w-10 h-10 text-green-500" />
    },
    {
      name: 'Block Puzzle',
      path: '/blockpuzzle',
      icon: <SquareIcon className="w-10 h-10 text-purple-500" />
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gamesList.map((game) => (
          <Link 
            key={game.path} 
            to={game.path} 
            className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-700 transition duration-300"
          >
            {game.icon}
            <span className="mt-4 text-white font-semibold">{game.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Games;