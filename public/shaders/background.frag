varying vec2 vUv;
uniform float uTime;

uniform float music;
uniform float music2;
uniform float music3;


void main() {
    vec3 colorB = vec3(music2, 1.0, 0.0);
    vec3 colorA = vec3(music,0.0,1.0);

    vec3 color = vec3(0.0);
    float pct = uTime * vUv.y;

    color = mix(colorA, colorB, vUv.y);

    gl_FragColor = vec4(color, 1.0 );
}
