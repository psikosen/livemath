const derivativeVis = (() => {
    const regl = createREGL(document.getElementById('derivative-vis'));
    let state = { 
        point: 0.5,
        showingTangent: false,
        animating: false
    };

    const drawCurve = regl({
        frag: `
            precision mediump float;
            uniform vec3 color;
            void main() {
                gl_FragColor = vec4(color, 1);
            }
        `,
        vert: `
            precision mediump float;
            attribute float t;
            
            float f(float x) {
                return sin(x * 3.14159 * 2.0) * 0.5;
            }
            
            void main() {
                float x = t * 2.0 - 1.0;
                float y = f(t);
                gl_Position = vec4(x, y, 0, 1);
            }
        `,
        attributes: {
            t: Array(200).fill().map((_, i) => i / 199)
        },
        uniforms: {
            color: [0.2, 0.5, 1.0]
        },
        primitive: 'line strip',
        count: 200
    });

    const drawTangent = regl({
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
            uniform float point;
            uniform float slope;
            
            void main() {
                float x = position.x;
                float y = slope * (x - point) + sin(point * 3.14159 * 2.0) * 0.5;
                gl_Position = vec4(x, y, 0, 1);
            }
        `,
        attributes: {
            position: [[-1, 0], [1, 0]]
        },
        uniforms: {
            color: [1.0, 0.3, 0.3],
            point: regl.prop('point'),
            slope: regl.prop('slope')
        },
        primitive: 'line strip',
        count: 2
    });

    regl.frame(() => {
        if (!state.animating && !state.showingTangent) return;

        regl.clear({
            color: [0.1, 0.1, 0.1, 1]
        });

        drawCurve();

        if (state.showingTangent) {
            const x = state.point * 2 - 1;
            const slope = Math.cos(state.point * Math.PI * 2) * Math.PI;
            drawTangent({ point: x, slope });
        }

        if (state.animating) {
            state.point = (state.point + 0.005) % 1;
        }
    });

    // Add event listener after DOM is loaded
    window.addEventListener('load', () => {
        document.getElementById('derivative-slider').addEventListener('input', (e) => {
            state.point = e.target.value / 100;
            state.showingTangent = true;
        });
    });

    return {
        showTangent() {
            state.showingTangent = true;
        },
        animate() {
            state.animating = !state.animating;
        }
    };
})();