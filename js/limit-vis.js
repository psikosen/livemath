const limitVis = (() => {
    const regl = createREGL(document.getElementById('limits-vis'));
    let state = { time: 0, animating: false };

    const drawFunction = regl({
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
            uniform float time;
            
            float f(float x) {
                return sin(x) / x;
            }
            
            void main() {
                float x = (t - 0.5) * 10.0;
                float y = f(x + time);
                gl_Position = vec4(t * 2.0 - 1.0, y * 0.5, 0, 1);
                gl_PointSize = 2.0;
            }
        `,
        attributes: {
            t: Array(1000).fill().map((_, i) => i / 999)
        },
        uniforms: {
            color: [0.2, 0.5, 1.0],
            time: regl.prop('time')
        },
        primitive: 'points',
        count: 1000
    });

    regl.frame(({ time }) => {
        if (!state.animating) return;
        
        regl.clear({
            color: [0.1, 0.1, 0.1, 1]
        });

        state.time = time;
        drawFunction({ time: Math.sin(time) * 0.5 });
    });

    return {
        animate() {
            state.animating = true;
        },
        reset() {
            state.animating = false;
            state.time = 0;
        }
    };
})();