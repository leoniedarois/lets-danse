varying vec2 vUv;
vec3 colorB = vec3(1.0, 1.0, 0.0);
vec3 colorA = vec3(1.0,0.0,1.0);

void main() {
    vec3 color = vec3(0.0);
    color = mix(colorA, colorB, vUv.y);

    gl_FragColor = vec4(color, 1.0 );
}
