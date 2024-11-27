// Integral Visualization
const integralVis = (() => {
    const container = document.getElementById('integral-vis');
    if (!container) return {}; // Guard clause

    const regl = createREGL({
        container,
        attributes: { antialias: true }
    });

    let state = {
        numRectangles: 10,
        showArea: false,
        function: x => Math.sin(x * Math.PI) * 0.5 + 0.5, // Default function
        lowerBound: 0,
        upperBound: 1,
        time: 0,
        animating: false
    };

    // Draw the main function curve
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
                return sin(x * 3.14159) * 0.5 + 0.5;
            }
            
            void main() {
                float x = t * 2.0 - 1.0;
                float y = f(t);
                gl_Position = vec4(x, y * 2.0 - 1.0, 0, 1);
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

    // Draw rectangles for Riemann sum
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
            uniform float height;
            
            void main() {
                float width = 2.0 / total;
                float x = position.x * width + (-1.0 + index * width);
                float y = position.y * height * 2.0 - 1.0;
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
            color: [0.3, 0.8, 0.3],
            alpha: 0.5,
            index: regl.prop('index'),
            total: regl.prop('total'),
            height: regl.prop('height')
        },
        primitive: 'triangles',
        count: 6
    });

    // Draw axes
    const drawAxes = regl({
        frag: `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.5, 0.5, 0.5, 1);
            }
        `,
        vert: `
            precision mediump float;
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0, 1);
            }
        `,
        attributes: {
            position: [
                [-1, 0], [1, 0], // x-axis
                [0, -1], [0, 1]  // y-axis
            ]
        },
        primitive: 'lines',
        count: 4
    });

    // Animation frame
    regl.frame(() => {
        if (!state.showArea && !state.animating) return;

        regl.clear({
            color: [0.1, 0.1, 0.1, 1]
        });

        // Draw axes
        drawAxes();

        // Draw main function
        drawFunction();

        if (state.showArea) {
            // Draw rectangles for Riemann sum
            for (let i = 0; i < state.numRectangles; i++) {
                const x = i / state.numRectangles;
                const height = state.function(x);
                
                drawRectangles({
                    index: i,
                    total: state.numRectangles,
                    height: height
                });
            }
        }

        if (state.animating) {
            state.time += 0.016;
            state.numRectangles = Math.floor(4 + (46 * Math.abs(Math.sin(state.time))));
            
            // Update slider if it exists
            const slider = document.getElementById('integral-slider');
            if (slider) {
                slider.value = state.numRectangles;
            }
        }
    });

    // Event handlers
    const slider = document.getElementById('integral-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            state.numRectangles = parseInt(e.target.value);
            if (state.showArea) {
                state.showArea = true;
            }
        });
    }

    // Calculate actual integral
    function calculateIntegral(fn, a, b, n) {
        const dx = (b - a) / n;
        let sum = 0;
        for (let i = 0; i < n; i++) {
            const x = a + i * dx;
            sum += fn(x) * dx;
        }
        return sum;
    }

    // Public API
    return {
        addRectangles() {
            state.showArea = true;
            state.animating = false;
        },
        
        showArea() {
            state.animating = !state.animating;
            if (state.animating) {
                state.time = 0;
                state.showArea = true;
            }
        },
        
        setFunction(fn) {
            state.function = fn;
        },
        
        setBounds(lower, upper) {
            state.lowerBound = lower;
            state.upperBound = upper;
        }
    };
})();