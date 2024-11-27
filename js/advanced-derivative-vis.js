// Advanced Derivative Visualization
(() => {
    // Initialize REGL
    const container = document.getElementById('derivative-vis');
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
        time: 0
    };

    // ... (rest of the visualization code) ...
})();