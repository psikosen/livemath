// Matrix Transformations Visualization
const matrixVis = (() => {
    const canvas = document.getElementById('matrix-transform-vis');
    const regl = createREGL(canvas);

    // Grid drawing command
    const drawGrid = regl({
        frag: `
            precision mediump float;
            varying vec2 vPos;
            void main() {
                vec2 grid = abs(fract(vPos - 0.5) - 0.5) / fwidth(vPos);
                float line = min(grid.x, grid.y);
                float color = 1.0 - smoothstep(0.0, 1.0, line);
                gl_FragColor = vec4(vec3(color * 0.2 + 0.1), 1);
            }
        `,
        vert: `
            precision mediump float;
            attribute vec2 position;
            uniform mat3 transform;
            varying vec2 vPos;
            void main() {
                vec3 pos = transform * vec3(position, 1);
                vPos = position * 5.0;
                gl_Position = vec4(pos.xy, 0, 1);
            }
        `,
        attributes: {
            position: Array(100).fill().flatMap((_, i) => {
                const x = (i % 10) / 4.5 - 1;
                const y = Math.floor(i / 10) / 4.5 - 1;
                return [x, y];
            })
        },
        uniforms: {
            transform: regl.prop('transform')
        },
        count: 100,
        primitive: 'points',
        lineWidth: 1
    });

    // Vector drawing command
    const drawVectors = regl({
        frag: `
            precision mediump float;
            uniform vec3 color;
            void main() {
                gl_FragColor = vec4(color, 1);
            }
        `,
        vert: `
            precision mediump float;
            attribute vec2 position;
            uniform mat3 transform;
            void main() {
                vec3 pos = transform * vec3(position, 1);
                gl_Position = vec4(pos.xy, 0, 1);
            }
        `,
        attributes: {
            position: [
                [0, 0], [1, 0],  // x-axis
                [0, 0], [0, 1]   // y-axis
            ]
        },
        uniforms: {
            transform: regl.prop('transform'),
            color: regl.prop('color')
        },
        count: 4,
        primitive: 'lines',
        lineWidth: 2
    });

    // Animation state
    let state = {
        rotation: 0,
        scale: [1, 1],
        shear: [0, 0],
        animating: false,
        currentAnimation: null
    };

    // Matrix multiplication helper
    function multiplyMatrices(a, b) {
        return [
            a[0]*b[0] + a[1]*b[3], a[0]*b[1] + a[1]*b[4], a[0]*b[2] + a[1]*b[5],
            a[3]*b[0] + a[4]*b[3], a[3]*b[1] + a[4]*b[4], a[3]*b[2] + a[4]*b[5],
            a[6]*b[0] + a[7]*b[3], a[6]*b[1] + a[7]*b[4], a[6]*b[2] + a[7]*b[5]
        ];
    }

    // Create transformation matrix
    function createTransform(rotation, scale, shear) {
        const c = Math.cos(rotation);
        const s = Math.sin(rotation);
        return [
            scale[0] * c + shear[0] * s, -scale[0] * s + shear[0] * c, 0,
            scale[1] * s + shear[1] * c,  scale[1] * c + shear[1] * s, 0,
            0, 0, 1
        ];
    }

    // Animation loop
    regl.frame(({ time }) => {
        if (!state.animating) return;

        // Clear canvas
        regl.clear({
            color: [0.1, 0.1, 0.1, 1],
            depth: 1
        });

        // Update animation state
        if (state.currentAnimation === 'rotate') {
            state.rotation = time % (Math.PI * 2);
        } else if (state.currentAnimation === 'scale') {
            const scale = 0.5 + Math.sin(time * 2) * 0.5;
            state.scale = [scale, scale];
        } else if (state.currentAnimation === 'shear') {
            state.shear = [Math.sin(time) * 0.5, Math.cos(time) * 0.5];
        }

        // Create transformation matrix
        const transform = createTransform(state.rotation, state.scale, state.shear);

        // Draw grid
        drawGrid({ transform });

        // Draw basis vectors
        drawVectors({
            transform,
            color: [1, 0, 0]  // x-axis
        });
        drawVectors({
            transform,
            color: [0, 1, 0]  // y-axis
        });
    });

    // Public API
    return {
        rotate() {
            state.animating = true;
            state.currentAnimation = 'rotate';
            state.scale = [1, 1];
            state.shear = [0, 0];
        },
        scale() {
            state.animating = true;
            state.currentAnimation = 'scale';
            state.rotation = 0;
            state.shear = [0, 0];
        },
        shear() {
            state.animating = true;
            state.currentAnimation = 'shear';
            state.rotation = 0;
            state.scale = [1, 1];
        }
    };
})();