import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BunnyMesh,
  BirdMesh,
  ElephantMesh,
  TigerMesh,
  OwlMesh,
  FoxMesh,
  CatMesh,
  DragonMesh,
} from "./ProceduralPetMeshes";

interface Pet3DSceneProps {
  type: string;
  hunger?: number;
  energy?: number;
  happiness?: number;
  reducedMotion?: boolean;
  onPetClick?: () => void;
  isJoyful?: boolean;
}

const PetActor: React.FC<Pet3DSceneProps> = ({
  type,
  hunger = 100,
  energy = 100,
  reducedMotion = false,
  onPetClick,
  isJoyful = false,
}) => {
  const rootRef = useRef<THREE.Group>(null);

  // Estados de animação e locomoção suave
  const [posX, setPosX] = useState(0);
  const targetXRef = useRef(0);
  const directionRef = useRef<1 | -1>(1);
  const pauseTimeRef = useRef(0);
  const isWalkingRef = useRef(true);

  // Controle de pulo interativo
  const jumpVelRef = useRef(0);
  const jumpHeightRef = useRef(0);

  // Ângulos animados de membros
  const [earAngle, setEarAngle] = useState(0);
  const [wingAngle, setWingAngle] = useState(0);
  const [legAngle, setLegAngle] = useState(0);

  const isTired = hunger < 30 || energy < 30;

  const handlePointerDown = () => {
    // Pulo de alegria imediato ao tocar
    jumpVelRef.current = 0.08;
    if (onPetClick) {
      onPetClick();
    }
  };

  useFrame((state, delta) => {
    if (reducedMotion || !rootRef.current) return;

    const time = state.clock.getElapsedTime();
    const clampedDelta = Math.min(delta, 0.1);

    // 1. Pulo de alegria ao clicar ou ganhar XP
    if (isJoyful && jumpHeightRef.current <= 0) {
      jumpVelRef.current = 0.08;
    }

    if (jumpVelRef.current !== 0 || jumpHeightRef.current > 0) {
      jumpHeightRef.current += jumpVelRef.current;
      jumpVelRef.current -= 0.3 * clampedDelta; // Gravidade suave

      if (jumpHeightRef.current <= 0) {
        jumpHeightRef.current = 0;
        jumpVelRef.current = 0;
      }
    }

    // 2. Comportamento de caminhada e paradas para descanso
    if (!isTired) {
      pauseTimeRef.current -= clampedDelta;
      if (pauseTimeRef.current <= 0) {
        if (!isWalkingRef.current) {
          // Voltar a caminhar em direção oposta
          directionRef.current = directionRef.current === 1 ? -1 : 1;
          targetXRef.current = directionRef.current * (0.18 + Math.random() * 0.18);
          isWalkingRef.current = true;
        } else {
          // Verificar se chegou ao destino
          const dist = Math.abs(targetXRef.current - posX);
          if (dist < 0.05) {
            isWalkingRef.current = false;
            pauseTimeRef.current = 2.0 + Math.random() * 2.5; // Pausa para descansar
          }
        }
      }
    } else {
      isWalkingRef.current = false;
    }

    // Interpolação de movimento (lerp suave sem engasgos)
    const walkSpeed = isWalkingRef.current ? (isTired ? 0.3 : 0.7) : 0;
    const nextX = THREE.MathUtils.lerp(
      posX,
      isWalkingRef.current ? targetXRef.current : 0,
      walkSpeed * clampedDelta * 4
    );
    setPosX(nextX);

    // 3. Rotação do corpo na direção do movimento
    const targetRotY = isWalkingRef.current ? (directionRef.current === 1 ? 0.35 : -0.35) : 0;
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetRotY, clampedDelta * 5);

    // 4. Respiração suave e ajuste de altura para NUNCA cortar a cabeça
    const breathSpeed = isTired ? 1.5 : 3.0;
    const breathBob = Math.sin(time * breathSpeed) * (isTired ? 0.015 : 0.025);
    const baseGroundY = -0.46;
    rootRef.current.position.y = baseGroundY + breathBob + jumpHeightRef.current;
    rootRef.current.position.x = nextX;

    // 5. Movimentação dos membros (orelhas, asas e patinhas)
    const legFreq = isWalkingRef.current ? 8 : 0;
    setLegAngle(Math.sin(time * legFreq) * 0.35);

    const earSway = Math.sin(time * 4) * 0.15;
    setEarAngle(earSway);

    const wingFlap = isWalkingRef.current ? Math.sin(time * 12) * 0.35 : Math.sin(time * 3) * 0.1;
    setWingAngle(wingFlap);
  });

  const renderSpecies = () => {
    switch (type) {
      case "coruja":
      case "owl":
        return <OwlMesh type={type} isTired={isTired} wingAngle={wingAngle} legAngle={legAngle} />;
      case "bird":
        return <BirdMesh type={type} isTired={isTired} wingAngle={wingAngle} />;
      case "raposa":
      case "fox":
        return <FoxMesh type={type} isTired={isTired} earAngle={earAngle} legAngle={legAngle} />;
      case "gato_robo":
      case "cat":
        return <CatMesh type={type} isTired={isTired} earAngle={earAngle} legAngle={legAngle} />;
      case "dragao_livro":
      case "dragon":
        return <DragonMesh type={type} isTired={isTired} wingAngle={wingAngle} legAngle={legAngle} />;
      case "elephant":
        return <ElephantMesh type={type} isTired={isTired} earAngle={earAngle} legAngle={legAngle} />;
      case "tiger":
        return <TigerMesh type={type} isTired={isTired} earAngle={earAngle} legAngle={legAngle} />;
      case "bunny":
      default:
        return <BunnyMesh type={type} isTired={isTired} earAngle={earAngle} legAngle={legAngle} />;
    }
  };

  return (
    <group ref={rootRef} scale={0.65} onPointerDown={handlePointerDown}>
      {renderSpecies()}
    </group>
  );
};

const CameraController: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    // Alinhamento perpendicular com elevação no centro do mascote para enquadramento total
    camera.position.set(0, 0.26, 3.8);
    camera.lookAt(0, 0.26, 0);
  }, [camera]);
  return null;
};

export const Pet3DScene: React.FC<Pet3DSceneProps> = (props) => {
  return (
    <div className="w-full h-full relative cursor-pointer select-none">
      <Canvas
        camera={{ position: [0, 0.26, 3.8], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={props.reducedMotion ? "demand" : "always"}
      >
        <CameraController />
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />
        <directionalLight position={[-2, 2, -1]} intensity={0.5} />

        {/* Sombra suave de contato no chão para assentar o mascote perfeitamente */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
          <circleGeometry args={[0.55, 32]} />
          <meshBasicMaterial color="#000000" opacity={0.14} transparent />
        </mesh>

        <PetActor {...props} />
      </Canvas>
    </div>
  );
};

export default Pet3DScene;
