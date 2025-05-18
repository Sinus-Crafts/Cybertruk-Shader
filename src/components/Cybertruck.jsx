import { useGLTF, shaderMaterial } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { extend, useFrame } from '@react-three/fiber'
import { useControls } from "leva";



import stripesVertex from "../shaders/stripes.vertex.glsl"
import stripesFragment from "../shaders/stripes.fragment.glsl"

const StripesShaderMaterial = shaderMaterial(
  { 
    uAlpha: 0.5,
    uMultiplier: 42,
    uColorA: new THREE.Color(0x000000),
    uColorB: new THREE.Color(0x000000),
    uTime: 0,
  },
  stripesVertex,
  stripesFragment
);

import disksVertex from "../shaders/disks.vertex.glsl"
import disksFragment from "../shaders/disks.fragment.glsl"

const DisksShaderMaterial = shaderMaterial(
  { 
    uAlpha: 0.5,
    uMultiplier: 42,
    uColorA: new THREE.Color(0x000000),
    uColorB: new THREE.Color(0x000000),
    uTime: 0,
  },
  disksVertex,
  disksFragment
);

extend({ StripesShaderMaterial })
extend({ DisksShaderMaterial })

export function Cybertruck(props) {
  const { nodes, materials } = useGLTF("./models/cybertruck.gltf");

  const { shader } = useControls ({
    shader:{
      options:["none", "disks", "stripes"],
    }
  })

  const speed = 0.1;
  const turnSpeed = 0.03

  const [keys, setKeys] = useState({});


  const stripesControls = useControls('stripes',{
    alpha:{
      min: 0,
      max: 1,
      value: 0.5,
    },
    multiplier:{
      min: 1,
      max: 142,
      value: 42
    },
    colorA: "#FF0000",
    colorB: "#FFF000",
  });

  const disksControls = useControls('disks',{
    alpha:{
      min: 0,
      max: 1,
      value: 0.5,
    },
    multiplier:{
      min: 1,
      max: 142,
      value: 22
    },
    colorA: "#FF0000",
    colorB: "#0000FF",
  });


  const ref = useRef();
  const carRef = useRef();


  useFrame((state) => {
    if(ref.current){
    ref.current.uTime = state.clock.elapsedTime;
    }


    if (carRef.current) { 
      const direction = new THREE.Vector3(0, 0, 1);
      //carRef.current.getWorldDirection(direction);

      direction.applyQuaternion(carRef.current.quaternion);

      // Vorwärts-/Rückwärtsbewegung
      if (keys["ArrowUp"] || keys["KeyW"]) {
        carRef.current.position.addScaledVector(direction, speed);
        carRef.current.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.material.needsUpdate = true;
          }
        });
      }
      if (keys["ArrowDown"] || keys["KeyS"]) {
        carRef.current.position.addScaledVector(direction, -speed);
        carRef.current.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.material.needsUpdate = true;
          }
        });
      }

      // Links/Rechts drehen
      if (keys["ArrowLeft"] || keys["KeyA"]) {
        carRef.current.rotation.y += turnSpeed;
        carRef.current.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.material.needsUpdate = true;
          }
        });
      }
      if (keys["ArrowRight"] || keys["KeyD"]) {
        carRef.current.rotation.y -= turnSpeed;
        carRef.current.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.material.needsUpdate = true;
          }
        });
      }
    }    
  });

  useEffect(() => {
    materials.lights.toneMapped = false;
    materials.warninglights.toneMapped = false;
    materials.warninglights.color = new THREE.Color(82, 0, 0);

    const handleKeyDown = (e) => setKeys((keys) => ({ ...keys, [e.code]: true }));
    const handleKeyUp = (e) => setKeys((keys) => ({ ...keys, [e.code]: false }));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };

  });
  return (
    <group ref={carRef} {...props} dispose={null}>
      <mesh geometry={nodes.interior001.geometry} material={materials.lights} />
      <mesh geometry={nodes.interior001_1.geometry} castShadow>
        <meshStandardMaterial {...materials.body} />
      </mesh>
      <mesh geometry={nodes.interior001_2.geometry}>
        <meshStandardMaterial
          opacity={0.92}
          envMapIntensity={1}
          transparent
          roughness={0.2}
          color={"black"}
        />
      </mesh>
      <mesh
        geometry={nodes.interior001_3.geometry}
        material={materials.glassframes}
        castShadow
      />
      <mesh
        geometry={nodes.interior001_4.geometry}
        material={materials.warninglights}
      />
      <mesh
        geometry={nodes.interior001_5.geometry}
        material={materials.black}
        castShadow
      />
      {/* BODY MESH -> SHADER */}
      {
        shader === "disks" && (     
      <mesh geometry={nodes.interior001_6.geometry}>
        <disksShaderMaterial           
          ref= {ref}
            transparent
            uAlpha={disksControls.alpha} 
            uMultiplier={disksControls.multiplier}
            uColorA={disksControls.colorA}
            uColorB={disksControls.colorB}
        />      
      </mesh>
      )}
      {
        shader === "stripes" && (   
      <mesh geometry={nodes.interior001_6.geometry}>
        <stripesShaderMaterial           
          ref= {ref}
            transparent
            uAlpha={stripesControls.alpha} 
            uMultiplier={stripesControls.multiplier}
            uColorA={stripesControls.colorA}
            uColorB={stripesControls.colorB}
        />
      </mesh> 
      )}

      <mesh geometry={nodes.steer.geometry} material={materials.gray} />
      <mesh
        geometry={nodes.tires001.geometry}
        material={materials.tires}
        castShadow
      />
      <mesh
        geometry={nodes.tires001_1.geometry}
        material={materials.rims}
        castShadow
      />
    </group>
  );
}

useGLTF.preload("./models/cybertruck.gltf");
