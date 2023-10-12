
export const vsCode = `
precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec2 position0;
in float radius0;
in float summedLength0;
in vec2 position1;
in float radius1;
in float summedLength1;

out vec2 p; // position of the current pixel
flat out vec2 p0;
flat out float r0;
flat out float l0;
flat out vec2 p1;
flat out float r1;
flat out float l1;

void main(){
    // Pass flat(non-interpolated) values to the fragment shader
    r0 = radius0;
    r1 = radius1;
    p0 = position0;
    p1 = position1;
    l0 = summedLength0;
    l1 = summedLength1;

    vec2 tangentDirection = normalize(position1 - position0);
    vec2 normalDirection = vec2(-tangentDirection.y, tangentDirection.x);
    float cosTheta = (r0 - r1)/distance(p0, p1); // theta is the angle stroke tilt, there is a diagram in README to explain this.
    // the vertex1 with radius is fully inside the vertex0.
    if(abs(cosTheta) >= 1.0) return; 
    
    // Each instance is a trapzoid, whose vertices' positions are determined here. 
    // Use gl_VertexID {0, 1, 2, 3} to index and get the desired parameters.
    // Be careful with the backface culling! We are ignoring it here.
    vec2[] offsetSigns = vec2[](
        vec2(-1.0,-1.0),
        vec2(-1.0, 1.0), 
        vec2( 1.0, 1.0),
        vec2( 1.0,-1.0));
    vec2 offsetSign = offsetSigns[gl_VertexID];

    vec2[] polylineVertexPositions = vec2[](position0, position0, position1, position1);
    vec2 pos = polylineVertexPositions[gl_VertexID];
    
    float radius = vec4(radius0, radius0, radius1, radius1)[gl_VertexID];

    float tanHalfTheta = sqrt((1.0+cosTheta) / (1.0-cosTheta));
    float cotHalfTheta = 1.0 / tanHalfTheta;
    float normalTanValue = vec4(tanHalfTheta, tanHalfTheta, cotHalfTheta, cotHalfTheta)[gl_VertexID];
    if(normalTanValue > 10.0 || normalTanValue < 0.1) return;
    
    vec2 trapzoidVertexPosition = pos + 
        offsetSign.x * radius * tangentDirection + 
        offsetSign.y * radius * normalDirection * normalTanValue;
    p = trapzoidVertexPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(trapzoidVertexPosition, 0.0, 1.0);
}
`

export const fsCode = `
precision mediump float;
precision mediump int;

in vec2 p;
flat in vec2 p0;
flat in float r0;
flat in float l0;
flat in vec2 p1;
flat in float r1;
flat in float l1;

// Common
uniform int type;
const int Vanilla = 0, Stamp = 1, Airbrush = 2;
uniform vec3 color;
uniform float alpha;
uniform float uniRadius;
// Stamp
uniform mediump sampler2D footprint;
uniform float stampInterval;
uniform float noiseFactor;
uniform float rotationFactor;
uniform int stampMode;
const int EquiDistance = 0, RatioDistance = 1;
float x2n(float x); // from distance to stamp index.
float n2x(float n); // from stamp index to distance.
mat2 rotate(float angle);
// Airbrush
uniform mediump sampler2D gradient;
float sampleGraident(float distance){ return texture(gradient, vec2(distance, 0.0)).r; }

// Output
out vec4 outColor;

// Noise helper functions from _The Book of Shader_.
float random (in vec2 st);
float noise (in vec2 st);
float fbm (in vec2 st);

void main(){
    vec2 tangent = normalize(p1 - p0);
    vec2 normal = vec2(-tangent.y, tangent.x);

    // The local coordinate orgin at p0, x axis along the tangent direct.
    float len = distance(p1, p0);
    vec2 pLocal = vec2(dot(p-p0, tangent), dot(p-p0, normal));
    vec2 p0Local = vec2(0, 0);
    vec2 p1Local = vec2(len, 0);

    float cosTheta = (r0 - r1)/len;
    float d0 = distance(p, p0);
    float d0cos = pLocal.x / d0;
    float d1 = distance(p, p1);
    float d1cos = (pLocal.x - len) / d1;

    // Remove corners
    if(d0cos < cosTheta && d0 > r0) discard;
    if(d1cos > cosTheta && d1 > r1) discard;
    
    // Type specific parts
    if(type == Vanilla){
        if(d0 < r0 && d1 < r1) discard;
        float A = (d0 < r0 || d1 < r1) ? 1.0 - sqrt(1.0 - alpha) : alpha;
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    if(type == Stamp){
        // The method here is not published yet, it should be explained in a 10min video.
        // The footprint is a disk instead of a square.
        // We set a quadratic polynomial to calculate the effect range, the range on polyline edge footprint can touch the current pixel.
        // Two roots of the quadratic polynomial are the effectRangeFront and effectRangeBack.
        // Formulas from SIGGRAPH 2022 Talk - A Fast & Robust Solution for Cubic & Higher-Order Polynomials
        float a, b, c, delta;
        a = 1.0 - pow(cosTheta, 2.0);
        b = 2.0 * (r0 * cosTheta - pLocal.x);
        c = pow(pLocal.x, 2.0) + pow(pLocal.y, 2.0) - pow(r0, 2.0);
        delta = pow(b, 2.0) - 4.0*a*c;
        if(delta <= 0.0) discard; // This should never happen.
        
        float tempMathBlock = b + sign(b) * sqrt(delta);
        float x1 = -2.0 * c / tempMathBlock;
        float x2 = -tempMathBlock / (2.0*a);
        float effectRangeFront = x1 <= x2 ? x1 : x2;
        float effectRangeBack = x1 > x2 ? x1 : x2;

        // We stamp on polyline every time the stamp index comes to an integer.
        float index0 = l0/stampInterval; // The stamp index of vertex0.
        float startIndex, endIndex;
        if (effectRangeFront <= 0.0){
            startIndex = ceil(index0);
        }
        else{
            startIndex = ceil(index0 + x2n(effectRangeFront));
        }
        float index1 = l1/stampInterval;
        float backIndex = x2n(effectRangeBack) + index0;
        endIndex = index1 < backIndex ? index1 : backIndex;
        if(startIndex > endIndex) discard;

        // The main loop to sample and blend color from the footprint.
        int MAX_i = 128; float currIndex = startIndex;
        float A = 0.0;
        for(int i = 0; i < MAX_i; i++){
            float currStampLocalX = n2x(currIndex - index0);
            // Apply rotation and sample the footprint.
            vec2 pToCurrStamp = pLocal - vec2(currStampLocalX, 0.0);
            float currStampRadius = r0 - cosTheta * currStampLocalX;
            float angle = rotationFactor*radians(360.0*fract(sin(currIndex)*1.0));
            pToCurrStamp *= rotate(angle);
            vec2 textureCoordinate = (pToCurrStamp/currStampRadius + 1.0)/2.0;
            // float opacity = length(pToCurrStamp) > currStampRadius ? 0.0:0.5;
            float opacity = texture(footprint, textureCoordinate).r;
            // Blend opacity.
            float opacityNoise = noiseFactor*fbm(textureCoordinate*50.0);
            opacity = clamp(opacity - opacityNoise, 0.0, 1.0) * alpha;
            A = A * (1.0-opacity) + opacity;

            currIndex += 1.0;
            if(currIndex > endIndex) break;
        }
        if(A < 1e-4) discard;
        outColor = vec4(color, A);
        return;
    }

    if(type == Airbrush){
        // The method here is not published yet. Shen is not fully satisfied with the current solution.
        float tanTheta = sqrt(1.0 - cosTheta*cosTheta)/cosTheta;
        float mid = pLocal.x - abs(pLocal.y)/tanTheta;
        float A = alpha;
        float transparency0 = d0 > r0 ? 1.0:sqrt(1.0 - A*sampleGraident(d0/r0));
        float transparency1 = d1 > r1 ? 1.0:sqrt(1.0 - A*sampleGraident(d1/r1));
        float transparency;

        // A bunch of math derived with the continuous form of airbrush here.
        if(mid <= 0.0){
            transparency = transparency0/transparency1;
        }
        if(mid > 0.0 && mid < len){
            float r = (mid * r1 + (len - mid) * r0)/len;
            float dr = distance(pLocal, vec2(mid, 0))/r;
            transparency = (1.0 - A*sampleGraident(dr))/transparency0/transparency1;
        }
        if(mid >= len){
            transparency = transparency1/transparency0;
        }

        outColor = vec4(color, 1.0 - transparency);
    }
    return;
}

float x2n(float x){
    if(stampMode == EquiDistance) return x / stampInterval / uniRadius;
    if(stampMode == RatioDistance){
        float L = distance(p0, p1);
        if(r0 == r1) return x/(stampInterval*r0);
        else return -L / stampInterval / (r0 - r1) * log(1.0 - (1.0 - r1/r0)/L * x);
    }
}

float n2x(float n){
    if(stampMode == EquiDistance) return n * stampInterval * uniRadius;
    if(stampMode == RatioDistance){
        float L = distance(p0, p1);
        if(r0 == r1) return n * stampInterval * r0;
        else return L * (1.0-exp(-(r0-r1)*n*stampInterval/L)) / (1.0-r1/r0);
    }
}

// Helper functions----------------------------------------------------------------------------------
mat2 rotate(float angle){
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                        vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}
`