import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const Kaleidoscope = ({ audioLevel, phase = 0, scale = 3.5 }) => {
  const mesh = useRef()
  const uniforms = useRef({
    time: { value: 0 },
    intensity: { value: 0 },
    phase: { value: phase },
  })

  useFrame((state) => {
    uniforms.current.time.value = state.clock.getElapsedTime()
    uniforms.current.intensity.value = 0.3 + audioLevel * 0.15
    uniforms.current.phase.value = phase
  })

  return (
    <mesh ref={mesh} scale={[scale, scale, scale]}>
      <planeGeometry args={[6, 6, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms.current}
        fragmentShader={`
          uniform float time;
          uniform float intensity;
          uniform float phase;
          varying vec2 vUv;

          // Indra brand colors
          vec3 indraGreen = vec3(0.671, 1.0, 0.451);
          vec3 indraPurpleSec = vec3(0.659, 0.447, 0.753);
          vec3 indraPurpleMain = vec3(0.169, 0.106, 0.220);
          vec3 indraBlue = vec3(0.557, 0.8, 0.851);
          vec3 indraPurpleTer = vec3(0.459, 0.373, 0.616);

          vec3 blendColors(vec3 c1, vec3 c2, float t) {
            return mix(c1, c2, smoothstep(0.0, 1.0, t));
          }

          void main() {
            vec2 uv = (vUv - 0.5) * 2.0;
            float r = length(uv);

            float rotation = (time + phase) * 0.05;
            float a = atan(uv.y, uv.x) + rotation;

            float symmetry = 16.0;
            float waves = sin(r * 4.0 - (time + phase) * 0.4) + cos(a * symmetry + (time + phase) * 0.2);

            float radial = exp(-r * 2.0) * (0.5 + 0.5 * sin((time + phase) * 0.5 + r * 2.5));
            float audioPulse = 0.3 + intensity * 0.15;

            float t = mod((time + phase) * 0.02, 5.0);
            vec3 base;
            if (t < 1.0) base = blendColors(indraPurpleMain, indraGreen, t);
            else if (t < 2.0) base = blendColors(indraGreen, indraBlue, t - 1.0);
            else if (t < 3.0) base = blendColors(indraBlue, indraPurpleSec, t - 2.0);
            else if (t < 4.0) base = blendColors(indraPurpleSec, indraPurpleTer, t - 3.0);
            else base = blendColors(indraPurpleTer, indraPurpleMain, t - 4.0);

            float brightness = smoothstep(1.2, 0.0, r) * (radial + 0.5 * waves) * audioPulse;
            brightness = max(brightness, 0.26);

            vec3 effect = base * (0.3 + brightness);

            // Soft vignette for more depth
            float vignette = smoothstep(1.05, 0.15, r);

            // Just use effect with vignette
            vec3 finalColor = effect * vignette;

            gl_FragColor = vec4(finalColor, 0.5); // semi-transparent for layering
          }
        `}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        side={THREE.DoubleSide}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}



export default Kaleidoscope
