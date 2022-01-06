const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uMvpMatrix;
uniform mat4 uProjection;
uniform mat4 uNormalMatrix;
uniform vec3 uLightPosition;
uniform vec3 uLightAttenuation;

out vec3 vEye;
out vec3 vLight;
out vec3 vNormal;
out vec2 vTexCoord;
out float vAttenuation;
out float vRedness;

void main() {
    vec3 vertexPosition = (uMvpMatrix * vec4(aPosition)).xyz;
    vec3 lightPosition = (uMvpMatrix * vec4(normalize(vec3(uLightPosition)), 1)).xyz;
    vEye = -vertexPosition;
    vLight = lightPosition - vertexPosition;
    vNormal = (uNormalMatrix * vec4(aNormal, 1)).xyz;
    vTexCoord = aTexCoord;

    float d = distance(vertexPosition, lightPosition);
    vAttenuation = 1.0 / dot(uLightAttenuation, vec3(1, d, d * d));

    gl_Position = uMvpMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;

uniform float uShininess;

in vec3 vEye;
in vec3 vLight;
in vec3 vNormal;
in vec2 vTexCoord;
in float vAttenuation;

uniform float uRedness;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vLight);
    vec3 E = normalize(vEye);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), uShininess);

    vec3 ambient = uAmbientColor;
    vec3 diffuse = uDiffuseColor * lambert;
    vec3 specular = uSpecularColor * phong;

    vec3 light = (ambient + diffuse + specular) * vAttenuation;

    oColor = oColor + texture(uTexture, vTexCoord) * vec4(light, 1);
    oColor = oColor + vec4(uRedness,0,0,0);
}
`;

export const shaders = {
    simple: { vertex, fragment }
};

// const vertex = `#version 300 es
// layout (location = 0) in vec4 aPosition;
// layout (location = 1) in vec2 aTexCoord;
// layout (location = 2) in vec3 aNormal;

// const vec3 lightDirection = normalize(vec3(0.6, 0.4, 0));

// uniform mat4 uMvpMatrix;
// uniform mat4 uNormalMatrix;


// out float vBrightness;
// out vec2 vTexCoord;
// out vec3 vLight;
// out float vRedness;


// void main() {
//   vTexCoord = aTexCoord;
//   gl_Position = uMvpMatrix * aPosition;

//   vec3 worldNormal = (uNormalMatrix * vec4(aNormal,1.0)).xyz;
//   float diffuse = max(0.1, dot(worldNormal, lightDirection));

//   vBrightness = diffuse + 0.4;
// }
// `;

// const fragment = `#version 300 es
// precision mediump float;
// uniform mediump sampler2D uTexture;

// uniform float uRedness;

// in vec2 vTexCoord;
// in vec3 vLight;
// in float vBrightness;

// out vec4 oColor;
// void main() {
//     oColor = texture(uTexture, vTexCoord);
//     oColor = oColor + vec4(uRedness,0,0,0);
//     oColor.xyz *= vBrightness;

// }
// `;

// export const shaders = {
//     simple: { vertex, fragment }

// };
