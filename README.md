# LiveMath: Interactive Mathematics Visualizations

An interactive mathematics learning platform that uses WebGL-based visualizations to explain complex concepts in an intuitive way.

## Features

### Fraction Division
- Visual representation of fractions using rectangular segments
- Interactive controls for animation and reset
- Clear visual distinction between numerator and denominator

### Linear Algebra
- Matrix transformation visualizations
- Eigenvector demonstrations
- Vector operations and basis changes

### Calculus (Feynman-style)
- Interactive derivative explorations
- Three visualization modes:
  - The Slope Story: Understanding derivatives as instantaneous slopes
  - Rate of Change: Visualizing instantaneous change
  - The Limit Dance: Demonstrating the limit concept
- Dynamic tangent and secant line visualizations
- Adjustable Δx for limit exploration

## Installation

1. Clone this repository
```bash
git clone https://github.com/psikosen/livemath.git
```

2. Open any of the HTML files in a modern web browser:
- index.html for fraction division
- linear.html for linear algebra
- calculus.html for calculus concepts
- derivatives.html for in-depth derivative exploration

## Usage

Each visualization comes with:
- Interactive controls
- Real-time animation options
- Explanatory text in a Feynman-inspired teaching style
- Mathematical formulas and intuitive analogies

## Dependencies

- regl.js for WebGL rendering
- Modern web browser with WebGL support

## Project Structure

```
livemath/
├── index.html           # Fraction division visualization
├── linear.html         # Linear algebra visualizations
├── calculus.html       # Basic calculus concepts
├── derivatives.html    # Advanced derivative exploration
├── js/
│   ├── fraction-vis.js
│   ├── matrix-transforms.js
│   ├── eigenvectors.js
│   ├── vector-operations.js
│   ├── limit-vis.js
│   ├── derivative-vis.js
│   └── integral-vis.js
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT