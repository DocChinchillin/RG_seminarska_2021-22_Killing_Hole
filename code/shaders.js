const vertex = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uMvpMatrix;
uniform mat4 uViewModel;
uniform mat4 uView;
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
    vec4 vertexPosition = (uViewModel * vec4(aPosition,1));
    vec3 lightPosition = (uView * vec4(uLightPosition, 1)).xyz;
    vec3 fragPos = vertexPosition.xyz / vertexPosition.w;
    vEye = -vertexPosition.xyz;
   
    
    vLight = lightPosition - vertexPosition.xyz;
 
    vNormal = (uNormalMatrix * vec4(aNormal, 0)).xyz;
    vTexCoord = aTexCoord;

    float d = distance(vertexPosition.xyz, lightPosition);
    vAttenuation = 1.0 / dot(uLightAttenuation, vec3(1, d, d * d));
    
    gl_Position = uProjection * vertexPosition;
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
    

    vec3 light = (ambient + diffuse + specular)* vAttenuation;

    oColor = texture(uTexture, vTexCoord) * vec4(light, 1);
    oColor = oColor + vec4(uRedness,0,0,0);
}
`;

export const shaders = {
    simple: { vertex, fragment }
};