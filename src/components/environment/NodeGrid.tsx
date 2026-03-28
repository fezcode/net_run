import { useGameStore } from '../../game/store';
import { NodeCube } from '../entities/NodeCube';

export function NodeGrid() {
  const guesses = useGameStore(s => s.guesses);
  const currentRow = useGameStore(s => s.currentRow);
  const currentInput = useGameStore(s => s.currentInput);
  const targetWord = useGameStore(s => s.targetWord);
  const gameStatus = useGameStore(s => s.gameStatus);
  const activeICE = useGameStore(s => s.activeICE);
  const phantomColumn = useGameStore(s => s.phantomColumn);

  const isMobile = window.innerWidth < 768;
  const spacing = isMobile ? 0.9 : 1.2;
  const cubeScale = isMobile ? 0.75 : 1;

  return (
    <group position={[-(targetWord.length - 1) * (spacing / 2), (6 - 1) * (spacing / 2), 0]}>
      {guesses.map((row, rowIndex) => (
        <group key={rowIndex} position={[0, -rowIndex * spacing, 0]}>
          {row.map((node, colIndex) => {
            const isCurrentRow = rowIndex === currentRow && gameStatus === 'hacking';
            const letter = isCurrentRow ? currentInput[colIndex] || '' : node.letter;
            const status = isCurrentRow ? 'none' : node.status;
            const isCurrentFocus = isCurrentRow && colIndex === currentInput.length;
            const isPhantom = activeICE.includes('PHANTOM_NODE') && colIndex === phantomColumn && !isCurrentRow;

            return (
              <group key={`${rowIndex}-${colIndex}`} scale={cubeScale}>
                <NodeCube
                  letter={letter}
                  status={status}
                  position={[colIndex * (spacing / cubeScale), 0, 0]}
                  isCurrentFocus={isCurrentFocus}
                  isPhantom={isPhantom}
                />
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}
