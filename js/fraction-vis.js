// Initialize regl
const regl = createREGL({
  extensions: ['OES_standard_derivatives']
});

// State for fractions and animation
let state = {
  fraction1: { num: 2, den: 3 },
  fraction2: { num: 1, den: 2 },
  animationTime: 0,
  isAnimating: false
};

// Create shader for fraction rectangles
const drawFractionRect = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    uniform float animationProgress;
    
    void main() {
      gl_FragColor = color;
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform float aspectRatio;
    uniform vec2 translation;
    uniform vec2 scale;
    uniform float rotation;
    uniform float animationProgress;

    void main() {
      // Apply rotation
      float c = cos(rotation);
      float s = sin(rotation);
      vec2 rotatedPos = vec2(
        position.x * c - position.y * s,
        position.x * s + position.y * c
      );
      
      // Apply scale and translation
      vec2 finalPos = (rotatedPos * scale + translation);
      finalPos.x /= aspectRatio;
      
      // Apply animation
      finalPos = mix(finalPos, finalPos * (1.0 + animationProgress * 0.5), animationProgress);
      
      gl_Position = vec4(finalPos, 0, 1);
    }
  `,
  attributes: {
    position: [
      [-0.5, -0.5],
      [0.5, -0.5],
      [-0.5, 0.5],
      [0.5, 0.5]
    ]
  },
  uniforms: {
    color: regl.prop('color'),
    translation: regl.prop('translation'),
    scale: regl.prop('scale'),
    rotation: regl.prop('rotation'),
    aspectRatio: ctx => ctx.viewportWidth / ctx.viewportHeight,
    animationProgress: regl.prop('animationProgress')
  },
  count: 4,
  primitive: 'triangle strip'
});

// Draw divider line
const drawDivider = regl({
  frag: `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(0.2, 0.2, 0.2, 1);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform float aspectRatio;
    void main() {
      vec2 pos = position;
      pos.x /= aspectRatio;
      gl_Position = vec4(pos, 0, 1);
    }
  `,
  attributes: {
    position: [
      [-0.8, -0.01],
      [0.8, -0.01],
      [-0.8, 0.01],
      [0.8, 0.01]
    ]
  },
  count: 4,
  primitive: 'triangle strip'
});

// Animation loop
regl.frame(({ time }) => {
  // Clear the canvas
  regl.clear({
    color: [0.95, 0.95, 0.95, 1],
    depth: 1
  });

  // Update animation state
  if (state.isAnimating) {
    state.animationTime = Math.min(state.animationTime + 0.016, 1);
  }

  const animationProgress = state.animationTime;

  // Draw first fraction (dividend)
  for (let i = 0; i < state.fraction1.den; i++) {
    const width = 1.4 / state.fraction1.den;
    const x = -0.7 + width * (i + 0.5);
    const isActive = i < state.fraction1.num;
    
    drawFractionRect({
      color: isActive ? [0.3, 0.6, 1.0, 1] : [0.8, 0.8, 0.8, 1],
      translation: [x, 0.3],
      scale: [width * 0.9, 0.2],
      rotation: 0,
      animationProgress: isActive ? animationProgress : 0
    });
  }

  // Draw division line
  drawDivider();

  // Draw second fraction (divisor)
  for (let i = 0; i < state.fraction2.den; i++) {
    const width = 1.4 / state.fraction2.den;
    const x = -0.7 + width * (i + 0.5);
    const isActive = i < state.fraction2.num;
    
    drawFractionRect({
      color: isActive ? [1.0, 0.5, 0.3, 1] : [0.8, 0.8, 0.8, 1],
      translation: [x, -0.3],
      scale: [width * 0.9, 0.2],
      rotation: animationProgress * Math.PI,
      animationProgress: isActive ? animationProgress : 0
    });
  }
});

// Add event listener for animation reset
window.resetAnimation = () => {
  state.animationTime = 0;
  state.isAnimating = true;
};

// Initial animation trigger
setTimeout(() => {
  state.isAnimating = true;
}, 1000);
