const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in float aRedness;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;
out float vRedness;

void main() {
    vTexCoord = aTexCoord;
    vRedness = aRedness;
    gl_Position = uMvpMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

in float vRedness;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
    oColor = oColor + vec4(vRedness,0,0,0);
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
