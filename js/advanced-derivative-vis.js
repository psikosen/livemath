// Advanced Derivative Visualization
(() => {
    // Initialize REGL
    const container = document.getElementById('derivative-vis');
    if (!container) return; // Guard clause if element doesn't exist
    
    const regl = createREGL({
        container,
        attributes: { antialias: true }
    });

    // State management
    const state = {
        mode: 'slope',
        point: 0.5,
        dx: 0.1,
        animating: false,
        time: 0,
        dragging: false
    };

    // Available functions to visualize
    const functions = {
        sine: x => Math.sin(x * Math.PI * 2) * 0.5,
        quadratic: x => (x * x - 0.5) * 0.5,
        exponential: x => Math.exp(x * 2 - 1) * 0.25 - 0.5,
        current: x => Math.sin(x * Math.PI * 2) * 0.5 // default
    };

    // Create basic line drawing command
    const drawLine = regl({
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
            uniform float aspectRatio;
            void main() {
                vec2 pos = position;
                pos.x /= aspectRatio;
                gl_Position = vec4(pos, 0, 1);
            }
        `,
        attributes: {
            position: regl.prop('positions')
        },
        uniforms: {
            color: regl.prop('color'),
            alpha: regl.prop('alpha'),
            aspectRatio: ctx => ctx.viewportWidth / ctx.viewportHeight
        },
        primitive: 'line strip',
        lineWidth: 2,
        count: regl.prop('count')
    });

    // Function to generate curve points
    function generateCurvePoints(fn, segments = 200) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * 2 - 1;
            const y = fn((x + 1) / 2);
            points.push([x, y]);
        }
        return points;
    }

    // Function to calculate derivative at a point
    function numericalDerivative(fn, x, dx = 0.0001) {
        const x1 = Math.max(0, Math.min(1, x - dx/2));
        const x2 = Math.max(0, Math.min(1, x + dx/2));
        const y1 = fn(x1);
        const y2 = fn(x2);
        return (y2 - y1) / (x2 - x1);
    }

    // Draw grid for reference
    const drawGrid = regl({
        frag: `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.2, 0.2, 0.2, 0.2);
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
            position: () => {
                const gridLines = [];
                // Vertical lines
                for (let x = -1; x <= 1; x += 0.2) {
                    gridLines.push([x, -1], [x, 1]);
                }
                // Horizontal lines
                for (let y = -1; y <= 1; y += 0.2) {
                    gridLines.push([-1, y], [1, y]);
                }
                return gridLines;
            }
        },
        primitive: 'lines',
        count: 40 * 2
    });

    // Main render loop
    regl.frame(({ time }) => {
        // Clear the canvas
        regl.clear({
            color: [0.1, 0.1, 0.1, 1],
            depth: 1
        });

        // Draw grid
        drawGrid();

        // Draw function curve
        const curvePoints = generateCurvePoints(functions.current);
        drawLine({
            positions: curvePoints,
            color: [0.2, 0.5, 1.0],
            alpha: 1.0,
            count: curvePoints.length
        });

        if (state.animating) {
            state.time += 0.016;
            state.point = (Math.sin(state.time) + 1) / 2;
        }

        // Calculate current derivative
        const x = state.point * 2 - 1;
        const y = functions.current(state.point);
        const derivative = numericalDerivative(functions.current, state.point);

        // Draw tangent line
        const tangentPoints = [
            [x - 0.5, y - derivative * 0.5],
            [x + 0.5, y + derivative * 0.5]
        ];
        drawLine({
            positions: tangentPoints,
            color: [1.0, 0.3, 0.3],
            alpha: 0.8,
            count: 2
        });

        // Draw point at current x
        const pointSize = 5;
        regl({
            frag: `
                precision mediump float;
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    if (length(center) > 0.5) discard;
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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
                    gl_PointSize = ${pointSize}.0;
                }
            `,
            attributes: {
                position: [[x, y]]
            },
            primitive: 'points',
            count: 1
        })();
    });

    // Event handlers
    function handleMouseMove(e) {
        if (!state.dragging) return;
        
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        state.point = Math.max(0, Math.min(1, x));
        
        // Update slider if it exists
        const slider = document.getElementById('point-slider');
        if (slider) {
            slider.value = state.point * 100;
        }
    }

    container.addEventListener('mousedown', () => {
        state.dragging = true;
    });

    container.addEventListener('mousemove', handleMouseMove);
    
    window.addEventListener('mouseup', () => {
        state.dragging = false;
    });

    // Expose public methods
    window.derivativeVis = {
        setMode(mode) {
            state.mode = mode;
            switch(mode) {
                case 'slope':
                    functions.current = functions.sine;
                    break;
                case 'rate':
                    functions.current = functions.exponential;
                    break;
                case 'limit':
                    functions.current = functions.quadratic;
                    break;
            }
        },
        
        toggleAnimation() {
            state.animating = !state.animating;
            state.time = 0;
        },
        
        reset() {
            state.animating = false;
            state.point = 0.5;
            state.time = 0;
            const slider = document.getElementById('point-slider');
            if (slider) {
                slider.value = 50;
            }
        }
    };
})();