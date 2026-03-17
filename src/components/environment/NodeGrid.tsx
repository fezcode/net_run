import { useGameStore } from '../../game/store';
import { NodeCube } from '../entities/NodeCube';

export function NodeGrid() {
  const guesses = useGameStore(s => s.guesses);
  const currentRow = useGameStore(s => s.currentRow);
  const currentInput = useGameStore(s => s.currentInput);
  const targetWord = useGameStore(s => s.targetWord);

  return (
    <group position={[-(targetWord.length - 1) * 0.6, (6 - 1) * 0.6, 0]}>
      {guesses.map((row, rowIndex) => (
        <group key={rowIndex} position={[0, -rowIndex * 1.2, 0]}>
          {row.map((node, colIndex) => {
            const isCurrentRow = rowIndex === currentRow;
            const letter = isCurrentRow ? currentInput[colIndex] || '' : node.letter;
            const status = isCurrentRow ? 'none' : node.status;
            const isCurrentFocus = isCurrentRow && colIndex === currentInput.length;

            return (
              <NodeCube
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                status={status}
                position={[colIndex * 1.2, 0, 0]}
                isCurrentFocus={isCurrentFocus}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}
