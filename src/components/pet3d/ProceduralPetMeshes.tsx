import React, { useRef } from "react";
import * as THREE from "three";

interface PetMeshProps {
  type: string;
  isTired?: boolean;
  earAngle?: number;
  wingAngle?: number;
  legAngle?: number;
}

export const BunnyMesh: React.FC<PetMeshProps> = ({ isTired, earAngle = 0, legAngle = 0 }) => {
  const earRefLeft = useRef<THREE.Group>(null);
  const earRefRight = useRef<THREE.Group>(null);

  return (
    <group position={[0, -0.2, 0]}>
      {/* Corpo arredondado */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>

      {/* Barriguinha macia */}
      <mesh position={[0, 0.4, 0.28]} scale={[0.7, 0.8, 0.4]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Cabeça fofa */}
      <group position={[0, 0.95, 0.05]} rotation={[isTired ? 0.2 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color="#fef08a" roughness={0.4} />
        </mesh>

        {/* Olhos pretos brilhantes */}
        <mesh position={[-0.15, 0.08, 0.35]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.1} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.35]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.1} />
        </mesh>

        {/* Focinho e nariz rosa */}
        <mesh position={[0, -0.02, 0.39]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#fb7185" roughness={0.3} />
        </mesh>

        {/* Bochechas coradas */}
        <mesh position={[-0.24, -0.04, 0.3]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#f472b6" roughness={0.5} opacity={0.6} transparent />
        </mesh>
        <mesh position={[0.24, -0.04, 0.3]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#f472b6" roughness={0.5} opacity={0.6} transparent />
        </mesh>

        {/* Orelhas compridas de coelho */}
        <group ref={earRefLeft} position={[-0.18, 0.35, 0]} rotation={[0, 0, -0.15 + earAngle]}>
          <mesh position={[0, 0.3, 0]}>
            <capsuleGeometry args={[0.08, 0.45, 12, 16]} />
            <meshStandardMaterial color="#fef08a" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, 0.04]} scale={[0.6, 0.8, 0.3]}>
            <capsuleGeometry args={[0.08, 0.45, 12, 16]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
          </mesh>
        </group>

        <group ref={earRefRight} position={[0.18, 0.35, 0]} rotation={[0, 0, 0.15 - earAngle]}>
          <mesh position={[0, 0.3, 0]}>
            <capsuleGeometry args={[0.08, 0.45, 12, 16]} />
            <meshStandardMaterial color="#fef08a" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, 0.04]} scale={[0.6, 0.8, 0.3]}>
            <capsuleGeometry args={[0.08, 0.45, 12, 16]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Patas dianteiras */}
      <mesh position={[-0.18, 0.35, 0.35]} rotation={[0.4, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.18, 8, 12]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.35, 0.35]} rotation={[0.4, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.18, 8, 12]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>

      {/* Patas traseiras / pés com animação de caminhada */}
      <mesh position={[-0.26, 0.08, 0.1]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.25, 8, 12]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>
      <mesh position={[0.26, 0.08, 0.1]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.25, 8, 12]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>

      {/* Rabinho fofo */}
      <mesh position={[0, 0.2, -0.45]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
};

export const OwlMesh: React.FC<PetMeshProps> = ({ isTired, wingAngle = 0, legAngle = 0 }) => {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Corpo roliço marrom acadêmico */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#78350f" roughness={0.4} />
      </mesh>

      {/* Peito e barriguinha bege cremosa */}
      <mesh position={[0, 0.48, 0.26]} scale={[0.8, 0.85, 0.4]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.5} />
      </mesh>

      {/* Cabeça sábia arredondada */}
      <group position={[0, 0.96, 0.08]} rotation={[isTired ? 0.15 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>

        {/* Tufo de penas/orelhas da coruja (Esquerda e Direita) */}
        <mesh position={[-0.22, 0.38, 0.02]} rotation={[-0.1, 0, -0.3]}>
          <coneGeometry args={[0.09, 0.28, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.38, 0.02]} rotation={[-0.1, 0, 0.3]}>
          <coneGeometry args={[0.09, 0.28, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.4} />
        </mesh>

        {/* Discos faciais redondos clássicos da coruja */}
        <mesh position={[-0.15, 0.06, 0.34]} scale={[1, 1, 0.2]}>
          <circleGeometry args={[0.16, 20]} />
          <meshStandardMaterial color="#fde68a" roughness={0.3} />
        </mesh>
        <mesh position={[0.15, 0.06, 0.34]} scale={[1, 1, 0.2]}>
          <circleGeometry args={[0.16, 20]} />
          <meshStandardMaterial color="#fde68a" roughness={0.3} />
        </mesh>

        {/* Olhos dourados de sabedoria */}
        <mesh position={[-0.15, 0.06, 0.38]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 0.06, 0.38]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} />
        </mesh>

        {/* Pupilas escuras com brilho */}
        <mesh position={[-0.15, 0.06, 0.46]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <mesh position={[0.15, 0.06, 0.46]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Pequeno bico curvado dourado */}
        <mesh position={[0, -0.05, 0.42]} rotation={[Math.PI / 2.2, 0, 0]}>
          <coneGeometry args={[0.06, 0.16, 10]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
      </group>

      {/* Asa Esquerda animada */}
      <group position={[-0.46, 0.55, 0]} rotation={[0, 0, -0.25 + wingAngle]}>
        <mesh scale={[0.16, 0.52, 0.38]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#92400e" roughness={0.4} />
        </mesh>
      </group>

      {/* Asa Direita animada */}
      <group position={[0.46, 0.55, 0]} rotation={[0, 0, 0.25 - wingAngle]}>
        <mesh scale={[0.16, 0.52, 0.38]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#92400e" roughness={0.4} />
        </mesh>
      </group>

      {/* Cauda em leque */}
      <mesh position={[0, 0.45, -0.48]} rotation={[-0.5, 0, 0]} scale={[0.35, 0.08, 0.4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#92400e" roughness={0.4} />
      </mesh>

      {/* Garrinhas/Patinhas que caminham */}
      <mesh position={[-0.14, 0.1, 0.05]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 12]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} />
      </mesh>
      <mesh position={[0.14, 0.1, 0.05]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 12]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} />
      </mesh>
    </group>
  );
};

export const BirdMesh: React.FC<PetMeshProps> = ({ isTired, wingAngle = 0 }) => {
  return (
    <group position={[0, -0.1, 0]}>
      {/* Corpo fofo arredondado */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.4} />
      </mesh>

      {/* Peito amarelo */}
      <mesh position={[0, 0.5, 0.25]} scale={[0.8, 0.9, 0.4]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fde047" roughness={0.5} />
      </mesh>

      {/* Cabeça */}
      <group position={[0, 0.95, 0.1]} rotation={[isTired ? 0.15 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.38, 20, 20]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.4} />
        </mesh>

        {/* Olhinhos */}
        <mesh position={[-0.14, 0.08, 0.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <mesh position={[0.14, 0.08, 0.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Bico laranja */}
        <mesh position={[0, 0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 12]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} />
        </mesh>

        {/* Penacho na cabeça */}
        <mesh position={[0, 0.4, -0.05]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.07, 0.25, 8]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} />
        </mesh>
      </group>

      {/* Asa Esquerda móvel */}
      <group position={[-0.45, 0.6, 0]} rotation={[0, 0, -0.2 + wingAngle]}>
        <mesh scale={[0.15, 0.5, 0.35]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* Asa Direita móvel */}
      <group position={[0.45, 0.6, 0]} rotation={[0, 0, 0.2 - wingAngle]}>
        <mesh scale={[0.15, 0.5, 0.35]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* Cauda */}
      <mesh position={[0, 0.5, -0.5]} rotation={[-0.4, 0, 0]} scale={[0.3, 0.1, 0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>

      {/* Patinhas */}
      <mesh position={[-0.12, 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.4} />
      </mesh>
      <mesh position={[0.12, 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.4} />
      </mesh>
    </group>
  );
};

export const ElephantMesh: React.FC<PetMeshProps> = ({ isTired, earAngle = 0, legAngle = 0 }) => {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Corpo roliço */}
      <mesh position={[0, 0.6, 0]} scale={[1, 0.9, 1.1]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>

      {/* Cabeça com tromba */}
      <group position={[0, 0.9, 0.25]} rotation={[isTired ? 0.2 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.45, 20, 20]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>

        {/* Olhos amigáveis */}
        <mesh position={[-0.18, 0.08, 0.38]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <mesh position={[0.18, 0.08, 0.38]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Tromba com curvatura fofa */}
        <group position={[0, -0.05, 0.42]} rotation={[0.4, 0, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.09, 0.3, 8, 12]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.3, 0.1]} rotation={[0.6, 0, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 8, 12]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
        </group>

        {/* Orelhas grandes que abanam */}
        <mesh position={[-0.45, 0.05, -0.05]} rotation={[0, -0.3 + earAngle, 0]} scale={[0.1, 0.7, 0.6]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        <mesh position={[0.45, 0.05, -0.05]} rotation={[0, 0.3 - earAngle, 0]} scale={[0.1, 0.7, 0.6]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
      </group>

      {/* 4 Patas sólidas estilo low poly arredondado */}
      <mesh position={[-0.25, 0.2, 0.25]} rotation={[legAngle, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[0.25, 0.2, 0.25]} rotation={[-legAngle, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[-0.25, 0.2, -0.25]} rotation={[-legAngle, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[0.25, 0.2, -0.25]} rotation={[legAngle, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
    </group>
  );
};

export const TigerMesh: React.FC<PetMeshProps> = ({ isTired, earAngle = 0, legAngle = 0 }) => {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Corpo de tigre laranja */}
      <mesh position={[0, 0.55, 0]} scale={[1, 0.85, 1.1]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#f97316" roughness={0.4} />
      </mesh>

      {/* Peito branco */}
      <mesh position={[0, 0.45, 0.3]} scale={[0.7, 0.8, 0.35]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Cabeça */}
      <group position={[0, 0.95, 0.2]} rotation={[isTired ? 0.15 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshStandardMaterial color="#f97316" roughness={0.4} />
        </mesh>

        {/* Focinho branco */}
        <mesh position={[0, -0.06, 0.32]} scale={[1.2, 0.8, 0.8]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>

        {/* Nariz marrom */}
        <mesh position={[0, 0.02, 0.44]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.05, 3]} />
          <meshStandardMaterial color="#451a03" roughness={0.3} />
        </mesh>

        {/* Olhos determinados */}
        <mesh position={[-0.16, 0.08, 0.35]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <mesh position={[0.16, 0.08, 0.35]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Listras tigradas na testa */}
        <mesh position={[0, 0.22, 0.35]} scale={[0.3, 0.04, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.15, 0.38]} scale={[0.2, 0.03, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Orelhas arredondadas com interior branco */}
        <group position={[-0.28, 0.3, 0]} rotation={[0, 0, -0.2 + earAngle]}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        <group position={[0.28, 0.3, 0]} rotation={[0, 0, 0.2 - earAngle]}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* Cauda listrada em balanço */}
      <group position={[0, 0.5, -0.5]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0.15, -0.15]} rotation={[-0.4, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.4, 8, 12]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
      </group>

      {/* Patas dianteiras e traseiras com caminhada */}
      <mesh position={[-0.22, 0.18, 0.2]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <mesh position={[0.22, 0.18, 0.2]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <mesh position={[-0.22, 0.18, -0.2]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <mesh position={[0.22, 0.18, -0.2]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
    </group>
  );
};

export const FoxMesh: React.FC<PetMeshProps> = ({ isTired, earAngle = 0, legAngle = 0 }) => {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Corpo esguio alaranjado */}
      <mesh position={[0, 0.52, 0]} scale={[0.9, 0.8, 1.1]}>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>

      {/* Peito e barriga branca */}
      <mesh position={[0, 0.45, 0.28]} scale={[0.65, 0.8, 0.35]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Cabeça de raposa astuta */}
      <group position={[0, 0.92, 0.18]} rotation={[isTired ? 0.15 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.38, 20, 20]} />
          <meshStandardMaterial color="#ea580c" roughness={0.4} />
        </mesh>

        {/* Focinho afilado */}
        <mesh position={[0, -0.05, 0.36]} rotation={[0.2 + Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.15, 0.3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>

        {/* Nariz preto pequeno */}
        <mesh position={[0, -0.02, 0.52]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Olhos amendoados vivos */}
        <mesh position={[-0.14, 0.08, 0.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <mesh position={[0.14, 0.08, 0.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Orelhas pontudas de raposa com ponta preta */}
        <group position={[-0.22, 0.32, 0]} rotation={[0, 0, -0.25 + earAngle]}>
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.12, 0.35, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0.03]} scale={[0.6, 0.7, 0.4]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <coneGeometry args={[0.06, 0.12, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        <group position={[0.22, 0.32, 0]} rotation={[0, 0, 0.25 - earAngle]}>
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.12, 0.35, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0.03]} scale={[0.6, 0.7, 0.4]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <coneGeometry args={[0.06, 0.12, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>

      {/* Cauda volumosa e felpuda com ponta branca */}
      <group position={[0, 0.5, -0.45]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0.25, -0.2]} rotation={[-0.3, 0, 0]}>
          <capsuleGeometry args={[0.16, 0.55, 12, 16]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.5, -0.32]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      </group>

      {/* 4 Patinhas pretas/escuras que andam */}
      <mesh position={[-0.2, 0.16, 0.2]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.08, 0.32, 8, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.2, 0.16, 0.2]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.08, 0.32, 8, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.2, 0.16, -0.2]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.08, 0.32, 8, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.2, 0.16, -0.2]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.08, 0.32, 8, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

export const CatMesh: React.FC<PetMeshProps> = ({ isTired, earAngle = 0, legAngle = 0 }) => {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Corpo robótico metalizado */}
      <mesh position={[0, 0.52, 0]} scale={[1, 0.85, 1.1]}>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Painel peitoral luminoso ciano */}
      <mesh position={[0, 0.45, 0.28]} scale={[0.65, 0.7, 0.3]}>
        <boxGeometry args={[0.6, 0.6, 0.2]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.3} metalness={0.8} />
      </mesh>

      {/* Cabeça de robô-gato */}
      <group position={[0, 0.92, 0.15]} rotation={[isTired ? 0.15 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.4, 20, 20]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Visor digital luminoso */}
        <mesh position={[0, 0.05, 0.34]} scale={[1, 0.55, 0.2]}>
          <boxGeometry args={[0.6, 0.3, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>

        {/* Olhos digitais LED ciano brilhantes */}
        <mesh position={[-0.15, 0.05, 0.37]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.15, 0.05, 0.37]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>

        {/* Orelhas mecânicas de gato */}
        <group position={[-0.24, 0.32, 0]} rotation={[0, 0, -0.2 + earAngle]}>
          <mesh position={[0, 0.12, 0]}>
            <coneGeometry args={[0.11, 0.26, 8]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.02]} scale={[0.6, 0.6, 0.3]}>
            <coneGeometry args={[0.09, 0.22, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
          </mesh>
        </group>

        <group position={[0.24, 0.32, 0]} rotation={[0, 0, 0.2 - earAngle]}>
          <mesh position={[0, 0.12, 0]}>
            <coneGeometry args={[0.11, 0.26, 8]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.02]} scale={[0.6, 0.6, 0.3]}>
            <coneGeometry args={[0.09, 0.22, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>

      {/* Cauda articulada mecânica */}
      <group position={[0, 0.5, -0.45]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0.2, -0.15]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.4, -0.25]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* 4 Patas cilíndricas que caminham */}
      <mesh position={[-0.2, 0.16, 0.2]} rotation={[legAngle, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.16, 0.2]} rotation={[-legAngle, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} />
      </mesh>
      <mesh position={[-0.2, 0.16, -0.2]} rotation={[-legAngle, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.16, -0.2]} rotation={[legAngle, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} />
      </mesh>
    </group>
  );
};

export const DragonMesh: React.FC<PetMeshProps> = ({ isTired, wingAngle = 0, legAngle = 0 }) => {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Corpo de dragão verde esmeralda */}
      <mesh position={[0, 0.55, 0]} scale={[1, 0.9, 1.15]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} />
      </mesh>

      {/* Peito e escamas douradas */}
      <mesh position={[0, 0.45, 0.28]} scale={[0.7, 0.8, 0.35]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fef08a" roughness={0.4} />
      </mesh>

      {/* Cabeça mítica */}
      <group position={[0, 0.95, 0.2]} rotation={[isTired ? 0.15 : 0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshStandardMaterial color="#10b981" roughness={0.4} />
        </mesh>

        {/* Focinho */}
        <mesh position={[0, -0.06, 0.35]} scale={[1, 0.7, 0.9]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#10b981" roughness={0.4} />
        </mesh>

        {/* Olhos dourados de dragão */}
        <mesh position={[-0.15, 0.08, 0.35]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.35]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} />
        </mesh>

        {/* Chifrinhos dourados */}
        <mesh position={[-0.2, 0.32, -0.05]} rotation={[-0.3, 0, -0.3]}>
          <coneGeometry args={[0.07, 0.25, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, 0.32, -0.05]} rotation={[-0.3, 0, 0.3]}>
          <coneGeometry args={[0.07, 0.25, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* Asinhas de dragão móveis */}
      <group position={[-0.45, 0.65, 0]} rotation={[0, 0, -0.3 + wingAngle]}>
        <mesh scale={[0.1, 0.45, 0.4]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.4, 0.8, 4]} />
          <meshStandardMaterial color="#059669" roughness={0.3} />
        </mesh>
      </group>

      <group position={[0.45, 0.65, 0]} rotation={[0, 0, 0.3 - wingAngle]}>
        <mesh scale={[0.1, 0.45, 0.4]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.4, 0.8, 4]} />
          <meshStandardMaterial color="#059669" roughness={0.3} />
        </mesh>
      </group>

      {/* Cauda com ponta de flecha */}
      <group position={[0, 0.5, -0.5]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0.2, -0.2]} rotation={[-0.4, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, 0.45, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.25, 4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* 4 Patas com garras que caminham */}
      <mesh position={[-0.22, 0.18, 0.2]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <mesh position={[0.22, 0.18, 0.2]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <mesh position={[-0.22, 0.18, -0.2]} rotation={[-legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <mesh position={[0.22, 0.18, -0.2]} rotation={[legAngle, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 8, 12]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
    </group>
  );
};
