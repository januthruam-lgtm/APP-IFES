import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  BunnyMesh,
  OwlMesh,
  BirdMesh,
  FoxMesh,
  ElephantMesh,
  TigerMesh,
  CatMesh,
  DragonMesh,
} from "./ProceduralPetMeshes";

interface Pet3DSceneProps {
  type?: string;
  hunger?: number;
  energy?: number;
  happiness?: number;
  reducedMotion?: boolean;
  onPetClick?: () => void;
  isJoyful?: boolean;
}

const PetActor: React.FC<Pet3DSceneProps> = ({
  type = "coruja",
  hunger = 85,
  energy = 90,
  reducedMotion = false,
  onPetClick,
  isJoyful = false,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const [posX, setPosX] = useState(0);
  const [legAngle, setLegAngle] = useState(0);
  const [earAngle, setEarAngle] = useState(0);
  const [wingAngle, setWingAngle] = useState(0);

  // Estados de IA procedurais do pet
  const isWalkingRef = useRef<boolean>(false);
  const targetXRef = useRef<number>(0);
  const directionRef = useRef<number>(1);
  const pauseTimeRef = useRef<number>(1.5);
  const jumpHeightRef = useRef<number>(0);
  const jumpVelRef = useRef<number>(0);

  const isTired = hunger < 30 || energy < 30;

  const handlePointerDown = (e: any) => {
    e.stopPropagation?.();
    // Pulo de alegria imediato e carinhoso ao tocar
    jumpVelRef.current = 0.06;
    if (onPetClick) {
      onPetClick();
    }
  };

  useFrame((state, delta) => {
    if (reducedMotion || !rootRef.current) return;

    const time = state.clock.getElapsedTime();
    const clampedDelta = Math.min(delta, 0.05);

    // 1. Pulo de alegria ao clicar, ganhar XP ou alimentar
    if (isJoyful && jumpHeightRef.current <= 0 && jumpVelRef.current <= 0) {
      jumpVelRef.current = 0.06;
    }

    if (jumpVelRef.current !== 0 || jumpHeightRef.current > 0) {
      jumpHeightRef.current += jumpVelRef.current;
      jumpVelRef.current -= 0.28 * clampedDelta * 60 * 0.016; // Gravidade suave estabilizada

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
          // Voltar a caminhar em direção oposta dentro dos limites seguros da tela
          directionRef.current = directionRef.current === 1 ? -1 : 1;
          targetXRef.current = directionRef.current * (0.12 + Math.random() * 0.14);
          isWalkingRef.current = true;
        } else {
          // Verificar se chegou ao destino
          const dist = Math.abs(targetXRef.current - posX);
          if (dist < 0.04) {
            isWalkingRef.current = false;
            pauseTimeRef.current = 2.0 + Math.random() * 2.5; // Pausa para descansar
          }
        }
      }
    } else {
      isWalkingRef.current = false;
    }

    // Interpolação de movimento (lerp suave sem engasgos)
    const walkSpeed = isWalkingRef.current ? (isTired ? 0.3 : 0.65) : 0;
    const nextX = THREE.MathUtils.lerp(
      posX,
      isWalkingRef.current ? targetXRef.current : 0,
      walkSpeed * clampedDelta * 4
    );
    setPosX(nextX);

    // 3. Rotação do corpo na direção do movimento
    const targetRotY = isWalkingRef.current ? (directionRef.current === 1 ? 0.3 : -0.3) : 0;
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetRotY, clampedDelta * 5);

    // 4. Respiração suave e ajuste vertical para NUNCA cortar a cabeça
    const breathSpeed = isTired ? 1.5 : 2.8;
    const breathBob = Math.sin(time * breathSpeed) * (isTired ? 0.01 : 0.018);
    const baseGroundY = -0.40;
    rootRef.current.position.y = baseGroundY + breathBob + jumpHeightRef.current;
    rootRef.current.position.x = nextX;

    // 5. Movimentação dos membros (orelhas, asas e patinhas)
    const legFreq = isWalkingRef.current ? 8 : 0;
    setLegAngle(Math.sin(time * legFreq) * 0.32);

    const earSway = Math.sin(time * 3.5) * 0.12;
    setEarAngle(earSway);

    const wingFlap = isWalkingRef.current ? Math.sin(time * 12) * 0.32 : Math.sin(time * 2.8) * 0.09;
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
    <group ref={rootRef} scale={0.58} onPointerDown={handlePointerDown}>
      {renderSpecies()}
    </group>
  );
};

const CameraController: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    // Alinhamento perpendicular com elevação no centro do mascote para enquadramento 100% completo
    camera.position.set(0, 0.20, 4.3);
    camera.lookAt(0, 0.20, 0);
  }, [camera]);
  return null;
};

export const Pet3DScene: React.FC<Pet3DSceneProps> = (props) => {
  return (
    <div className="w-full h-full relative cursor-pointer select-none">
      <Canvas
        camera={{ position: [0, 0.20, 4.3], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={props.reducedMotion ? "demand" : "always"}
      >
        <CameraController />
        <ambientLight intensity={1.25} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />
        <directionalLight position={[-2, 2, -1]} intensity={0.5} />

        {/* Sombra suave de contato no chão para assentar o mascote perfeitamente */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial color="#000000" opacity={0.14} transparent />
        </mesh>

        <PetActor {...props} />
      </Canvas>
    </div>
  );
};

export default Pet3DScene;
