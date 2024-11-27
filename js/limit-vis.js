// Limit Visualization
const limitVis = (() => {
    const container = document.getElementById('limits-vis');
    if (!container) return {}; // Guard clause

    const regl = createREGL({
        container,
        attributes: { antialias: true }
    });

    let state = { 
        time: 0, 
        animating: false,
        approaching: 0.5, // The x value we're approaching
        epsilon: 0.1     // How close we get
    };

    // Function with a "hole" at x = 0.5
    function f(x) {
        if (Math.abs(x - 0.5) < 0.001) return null;
        return Math.sin(x * Math.PI * 2) * ((x - 0.5) / Math.abs(x - 0.5));
    }

    // Draw the main function
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
                float dx = x - 0.5;
                return sin(x * 3.14159 * 2.0) * sign(dx);
            }
            
            void main() {
                float x = t * 2.0 - 1.0;
                float y = f(t);
                gl_Position = vec4(x, y * 0.5, 0, 1);
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

    // Draw approaching points
    const drawPoints = regl({
        frag: `
            precision mediump float;
            uniform vec3 color;
            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        vert: `
            precision mediump float;
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0, 1);
                gl_PointSize = 8.0;
            }
        `,
        attributes: {
            position: regl.prop('points')
        },
        uniforms: {
            color: regl.prop('color')
        },
        primitive: 'points',
        count: regl.prop('count')
    });

    // Draw arrow indicators
    const drawArrows = regl({
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
            void main() {
                gl_Position = vec4(position, 0, 1);
            }
        `,
        attributes: {
            position: regl.prop('points')
        },
        uniforms: {
            color: regl.prop('color')
        },
        primitive: 'lines',
        count: regl.prop('count')
    });

    function generateArrowPoints(fromX, toX, y) {
        const points = [
            [fromX, y],
            [toX, y],
            // Arrow head
            [toX, y],
            [toX - 0.1, y + 0.05],
            [toX, y],
            [toX - 0.1, y - 0.05]
        ];
        return points;
    }

    // Animation frame
    regl.frame(({ time }) => {
        if (!state.animating && !state.dragging) return;

        regl.clear({
            color: [0.1, 0.1, 0.1, 1]
        });

        // Draw main function
        drawFunction({ time: state.time });

        if (state.animating) {
            state.time += 0.016;
            state.epsilon = Math.abs(Math.sin(state.time)) * 0.2;
        }

        // Draw approaching points
        const leftPoint = state.approaching - state.epsilon;
        const rightPoint = state.approaching + state.epsilon;
        const points = [
            [leftPoint * 2 - 1, f(leftPoint) * 0.5],
            [rightPoint * 2 - 1, f(rightPoint) * 0.5]
        ];

        drawPoints({
            points,
            color: [1.0, 0.3, 0.3],
            count: 2
        });

        // Draw arrows indicating approach
        const leftArrows = generateArrowPoints(
            leftPoint * 2 - 1.2,
            leftPoint * 2 - 1,
            f(leftPoint) * 0.5
        );
        
        const rightArrows = generateArrowPoints(
            rightPoint * 2 - 0.8,
            rightPoint * 2 - 1,
            f(rightPoint) * 0.5
        );

        drawArrows({
            points: leftArrows,
            color: [1.0, 0.5, 0.2],
            count: leftArrows.length
        });

        drawArrows({
            points: rightArrows,
            color: [1.0, 0.5, 0.2],
            count: rightArrows.length
        });
    });

    // Event handlers
    function updateFromMouse(e) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        state.approaching = Math.max(0.1, Math.min(0.9, x));
        
        // Update slider if it exists
        const slider = document.getElementById('limit-slider');
        if (slider) {
            slider.value = state.approaching * 100;
        }
    }

    let isDragging = false;
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateFromMouse(e);
    });

    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateFromMouse(e);
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Slider event listener
    const slider = document.getElementById('limit-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            state.approaching = e.target.value / 100;
        });
    }

    // Public API
    return {
        animate() {
            state.animating = !state.animating;
            state.time = 0;
        },
        
        reset() {
            state.animating = false;
            state.approaching = 0.5;
            state.epsilon = 0.1;
            state.time = 0;
            
            const slider = document.getElementById('limit-slider');
            if (slider) {
                slider.value = 50;
            }
        },
        
        setEpsilon(value) {
            state.epsilon = Math.max(0.01, Math.min(0.2, value));
        }
    };
})();