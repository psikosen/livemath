const integralVis = (() => {
    const regl = createREGL(document.getElementById('integral-vis'));
    let state = {
        numRectangles: 10,
        showArea: false
    };

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
            
            float f(float x) {
                return sin(x * 3.14159 * 2.0) * 0.5 + 0.5;
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

    const drawRectangles = regl({
        frag: `
            precision mediump float;
            uniform vec3 color;
            uniform float alpha;
            void main() {
                gl_FragColor = vec4(color, alpha);
            }
        `,
        vert: `
            precision mediump float;
            attribute vec2 position;
            uniform float index;
            uniform float total;
            
            float f(float x) {
                return sin(x * 3.14159 * 2.0) * 0.5 + 0.5;
            }
            
            void main() {
                float width = 2.0 / total;
                float x = position.x * width + (-1.0 + index * width);
                float height = f((index + 0.5) / total);
                float y = position.y * height;
                gl_Position = vec4(x, y, 0, 1);
            }
        `,
        attributes: {
            position: [
                [0, 0], [1, 0],
                [1, 1], [0, 1],
                [0, 0], [1, 1]
            ]
        },
        uniforms: {
            color: [1.0, 0.5, 0.2],
            alpha: 0.5,
            index: regl.prop('index'),
            total: regl.prop('total')
        },
        primitive: 'triangles',
        count: 6
    });

    regl.frame(() => {
        regl.clear({
            color: [0.1, 0.1, 0.1, 1]
        });

        drawFunction();

        if (state.showArea) {
            for (let i = 0; i < state.numRectangles; i++) {
                drawRectangles({
                    index: i,
                    total: state.numRectangles
                });
            }
        }
    });

    // Add event listener after DOM is loaded
    window.addEventListener('load', () => {
        document.getElementById('integral-slider').addEventListener('input', (e) => {
            state.numRectangles = parseInt(e.target.value);
            if (state.showArea) {
                state.showArea = true;
            }
        });
    });

    return {
        addRectangles() {
            state.numRectangles = parseInt(document.getElementById('integral-slider').value);
            state.showArea = true;
        },
        showArea() {
            state.showArea = !state.showArea;
        }
    };
})();