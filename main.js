  // Algebraic Expression Handler
class AlgebraicTerm {
    constructor(coefficient = 0, variables = {}) {
        this.coefficient = coefficient;
        this.variables = variables; // Format: {x: 1, y: 2} means x^1 y^2
    }

    static parse(input) {
        input = input.trim();
        if (input === '') return new AlgebraicTerm(0);
    
        // Handle pure numbers
        if (!isNaN(input)) {
            return new AlgebraicTerm(parseFloat(input));
        }
    
        let coefficient = 1;
        let variables = {};
    
        // Split the input into coefficient and variables
        const parts = input.match(/^(-?\d*\.?\d*)?([a-zA-Z].*)$/);
        
        if (parts) {
            if (parts[1] && parts[1] !== '-') {
                coefficient = parseFloat(parts[1]) || 1;
            } else if (parts[1] === '-') {
                coefficient = -1;
            }
    
            // Parse variables and their powers
            const varPart = parts[2];
            let currentVar = null;
            let powerAccumulator = '';
            let parsingPower = false;
    
            for (let i = 0; i < varPart.length; i++) {
                const char = varPart[i];
                
                if (char === '^') {
                    parsingPower = true;
                    continue;
                }
                
                if (char.match(/[a-zA-Z]/)) {
                    if (currentVar !== null && powerAccumulator) {
                        variables[currentVar] = parseInt(powerAccumulator);
                        powerAccumulator = '';
                    }
                    currentVar = char;
                    parsingPower = false;
                    // Only set to 1 if we're at the end AND we haven't seen a power
                    if (i === varPart.length - 1 && !parsingPower) {
                        variables[char] = 1; 
                    }
                } else if (char.match(/\d/) && parsingPower) {
                    powerAccumulator += char;
                    if (i === varPart.length - 1) {
                        variables[currentVar] = parseInt(powerAccumulator);
                    }
                }
            }
    
            // Handle any remaining variable without power - set power to 1
            if (currentVar && !powerAccumulator) {
                variables[currentVar] = 1;
            }
        }
    
        console.log('Parsing:', input, '→', { coefficient, variables });
    
        return new AlgebraicTerm(coefficient, variables);
    }
    

    add(other) {
        if (this.sameVariables(other)) {
            return new AlgebraicTerm(this.coefficient + other.coefficient, {...this.variables});
        }
        return null; // Cannot add terms with different variables
    }


    multiply(other) {
        // For debugging
        console.log('Multiplying terms:');
        console.log('This term variables:', this.variables);
        console.log('Other term variables:', other.variables);
        
        // Multiply coefficients
        const newCoefficient = this.coefficient * other.coefficient;
        
        // Create a new variables object
        const newVariables = {};
        
        // Add this term's variables first
        for (const [variable, power] of Object.entries(this.variables)) {
            newVariables[variable] = power;
        }
        
        // Add other term's variables, combining powers
        for (const [variable, power] of Object.entries(other.variables)) {
            newVariables[variable] = (newVariables[variable] || 0) + power;
        }
        
        return new AlgebraicTerm(newCoefficient, newVariables);
    }
    

    sameVariables(other) {
        const vars1 = Object.entries(this.variables).sort().toString();
        const vars2 = Object.entries(other.variables).sort().toString();
        return vars1 === vars2;
    }

    toString() {
        if (this.coefficient === 0) return '0';
        
        let result = '';
        
        // Handle coefficient
        if (this.coefficient !== 1 || Object.keys(this.variables).length === 0) {
            if (this.coefficient === -1 && Object.keys(this.variables).length > 0) {
                result += '-';
            } else {
                // Format coefficient to avoid trailing decimals
                result += Number.isInteger(this.coefficient) ? 
                    this.coefficient.toString() : 
                    this.coefficient.toFixed(3).replace(/\.?0+$/, '');
            }
        }

        // Sort variables for consistent output
        const sortedVars = Object.entries(this.variables).sort();
        
        // Group variables with their powers
        const varGroups = sortedVars.map(([variable, power]) => {
            if (power === 0) return '';
            if (power === 1) return variable;
            return `${variable}^${power}`;
        }).filter(term => term !== '');

        // Combine groups, using parentheses when needed
        if (varGroups.length > 0) {
            const varsString = varGroups.join('');
            // Add parentheses if coefficient isn't 1 or -1 and we have multiple variables
            if (Math.abs(this.coefficient) !== 1 && varGroups.length > 1) {
                return result + `(${varsString})`;
            }
            return result + varsString;
        }

        return result;
    }
}

// UI Control
document.getElementById('operation').addEventListener('change', function() {
    const operation = this.value;
    document.getElementById('gauss-section').style.display = 
        operation === 'gauss' ? 'block' : 'none';
    document.getElementById('multiplication-section').style.display = 
        operation === 'multiplication' ? 'block' : 'none';
});

// Matrix Generation
document.getElementById('generateGaussMatrix').addEventListener('click', generateGaussMatrix);
document.getElementById('generateMultiplicationMatrices').addEventListener('click', generateMultiplicationMatrices);
document.getElementById('solveMatrix').addEventListener('click', solve);

function generateGaussMatrix() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value) + 1;
    const container = document.getElementById('gauss-matrix-container');
    generateMatrix(container, rows, cols, 'gauss');
}

function generateMultiplicationMatrices() {
    const rows1 = parseInt(document.getElementById('matrix1-rows').value);
    const cols1 = parseInt(document.getElementById('matrix1-cols').value);
    const cols2 = parseInt(document.getElementById('matrix2-cols').value);
    
    generateMatrix(document.getElementById('matrix1-container'), rows1, cols1, 'matrix1');
    generateMatrix(document.getElementById('matrix2-container'), cols1, cols2, 'matrix2');
}

function generateMatrix(container, rows, cols, prefix) {
    container.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'text';  // Changed to text to allow algebraic input
            input.className = 'matrix-input';
            input.id = `${prefix}-${i}-${j}`;
            input.value = '';
            container.appendChild(input);

            if (prefix === 'gauss' && j === cols - 2) {
                const separator = document.createElement('span');
                separator.innerHTML = ' | ';
                container.appendChild(separator);
            }
        }
        container.appendChild(document.createElement('br'));
    }
}

// Matrix Operations
function solve() {
    const operation = document.getElementById('operation').value;
    if (operation === 'gauss') {
        solveGaussJordan();
    } else {
        solveMultiplication();
    }
}

function solveGaussJordan() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value) + 1;
    
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            const value = document.getElementById(`gauss-${i}-${j}`).value;
            row.push(AlgebraicTerm.parse(value));
        }
        matrix.push(row);
    }

    gaussJordan(matrix, rows, cols);
    document.getElementById('solution').value = formatMatrix(matrix);
}

// UI handler for matrix multiplication
function solveMultiplication() {
    const rows1 = parseInt(document.getElementById('matrix1-rows').value);
    const cols1 = parseInt(document.getElementById('matrix1-cols').value);
    const cols2 = parseInt(document.getElementById('matrix2-cols').value);

    // Read first matrix
    const matrix1 = Array(rows1).fill().map((_, i) =>
        Array(cols1).fill().map((_, j) => 
            AlgebraicTerm.parse(document.getElementById(`matrix1-${i}-${j}`).value)
        )
    );

    // Read second matrix
    const matrix2 = Array(cols1).fill().map((_, i) =>
        Array(cols2).fill().map((_, j) =>
            AlgebraicTerm.parse(document.getElementById(`matrix2-${i}-${j}`).value)
        )
    );

    // Calculate and display result
    const result = multiplyMatrices(matrix1, matrix2);
    document.getElementById('solution').value = formatMultiplicationResult(result);
}

// Main matrix multiplication function
function multiplyMatrices(matrix1, matrix2) {
    const rows1 = matrix1.length;
    const cols1 = matrix1[0].length;
    const cols2 = matrix2[0].length;
    
    // Create result matrix filled with zero terms
    const result = createZeroMatrix(rows1, cols2);
    
    // Perform matrix multiplication
    for (let i = 0; i < rows1; i++) {
        for (let j = 0; j < cols2; j++) {
            // Calculate each cell
            result[i][j] = calculateCell(matrix1[i], getColumn(matrix2, j));
        }
    }
    
    return result;
}

// Helper function to create a zero filled matrix
function createZeroMatrix(rows, cols) {
    return Array(rows).fill().map(() => 
        Array(cols).fill().map(() => new AlgebraicTerm(0))
    );
}

// Helper function to get a column from matrix
function getColumn(matrix, colIndex) {
    return matrix.map(row => row[colIndex]);
}

// Calculate single cell value by multiplying row and column
function calculateCell(row, column) {
    let terms = [];
    
    // Calculate all products first
    for (let i = 0; i < row.length; i++) {
        const product = row[i].multiply(column[i]);
        if (product.coefficient !== 0) {
            // Try to combine with existing terms
            let combined = false;
            for (let j = 0; j < terms.length; j++) {
                if (terms[j].sameVariables(product)) {
                    terms[j] = terms[j].add(product);
                    combined = true;
                    break;
                }
            }
            if (!combined) {
                terms.push(product);
            }
        }
    }

    // If no terms, return zero
    if (terms.length === 0) {
        return new AlgebraicTerm(0);
    }

    // If only one term, return it
    if (terms.length === 1) {
        return terms[0];
    }

    // Combine terms into a string representation
    const termStrings = terms.map(term => term.toString());
    const combinedString = termStrings.join(' + ').replace(/\+ -/g, '- ');
    
    // Create a special term that will be displayed properly
    const result = new AlgebraicTerm(1);
    result.toString = () => combinedString;
    
    return result;
}

// Helper function to combine variable powers
function combinedVariables(vars1, vars2) {
    const combined = {...vars1};
    
    // Add powers from second term
    for (const [variable, power] of Object.entries(vars2)) {
        if (power !== 0) {
            combined[variable] = (combined[variable] || 0) + power;
        }
    }
    
    // Remove variables with power 0
    return Object.fromEntries(
        Object.entries(combined).filter(([_, power]) => power !== 0)
    );
}

function gaussJordan(matrix, rows, cols) {
    for (let i = 0; i < rows; i++) {
        // Make pivot 1
        const pivot = matrix[i][i];
        if (pivot.coefficient !== 0) {
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = matrix[i][j].multiply(new AlgebraicTerm(1/pivot.coefficient));
            }
        }

        // Eliminate other rows
        for (let k = 0; k < rows; k++) {
            if (k !== i && matrix[k][i].coefficient !== 0) {
                const factor = matrix[k][i];
                for (let j = 0; j < cols; j++) {
                    const subtractTerm = matrix[i][j].multiply(factor);
                    if (matrix[k][j].sameVariables(subtractTerm)) {
                        matrix[k][j] = matrix[k][j].add(new AlgebraicTerm(-1).multiply(subtractTerm));
                    } else {
                        matrix[k][j] = new AlgebraicTerm(
                            matrix[k][j].coefficient - subtractTerm.coefficient,
                            {...matrix[k][j].variables, ...subtractTerm.variables}
                        );
                    }
                }
            }
        }
    }
}



function formatMatrix(matrix) {
    return matrix.map(row => {
        const lastTerm = row.pop();
        return row.map(term => term.toString()).join('  ') + ' | ' + lastTerm.toString();
    }).join('\n');
}

function formatMultiplicationResult(matrix) {
    return matrix.map(row => 
        row.map(term => term.toString()).join('  ')
    ).join('\n');
}
