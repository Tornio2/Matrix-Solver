document.getElementById('generateMatrix').addEventListener('click', generateMatrix);
document.getElementById('solveMatrix').addEventListener('click', solveMatrix);

// Generate matrix after pressing button
function generateMatrix() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value) + 1;  // extra column for constants
    const matrixContainer = document.getElementById('matrix-container');
    matrixContainer.innerHTML = ''; // Clear existing matrix

    // Create matrix input fields
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-input';
            input.id = `cell-${i}-${j}`;

            // Set initial value to nothing
            input.value = '';
            matrixContainer.appendChild(input);

            // Add a separator before the last column
            if (j === cols - 2) { 
                const separator = document.createElement('span');
                separator.innerHTML = ' | '; 
                matrixContainer.appendChild(separator);
            }
        }
        matrixContainer.appendChild(document.createElement('br'));
    }
}

// Matrix logic
function solveMatrix() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value) + 1;
    
    // Create the matrix
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            const value = parseFloat(document.getElementById(`cell-${i}-${j}`).value);
            row.push(value);
        }
        matrix.push(row);
    }

    // Apply Gauss-Jordan method
    gaussJordan(matrix, rows, cols);

    // Display result
    document.getElementById('solution').value = formatMatrix(matrix);
}

// Gauss-Jordan implementation
function gaussJordan(matrix, rows, cols) {
    for (let i = 0; i < rows; i++) {
        // Step 1: Make the diagonal element 1
        if (matrix[i][i] === 0) {
            for (let k = i + 1; k < rows; k++) {
                if (matrix[k][i] !== 0) {
                    swapRows(matrix, i, k);
                    break;
                }
            }
        }

        const pivot = matrix[i][i];
        if (pivot !== 0) {
            for (let j = 0; j < cols; j++) {
                matrix[i][j] /= pivot;
            }
        }

        // Step 2: Eliminate elements below
        for (let k = i + 1; k < rows; k++) {
            const factor = matrix[k][i];
            for (let j = 0; j < cols; j++) {
                matrix[k][j] -= factor * matrix[i][j];
            }
        }
    }

    // Step 3: Backward Elimination
    for (let i = rows - 1; i >= 0; i--) {
        for (let k = i - 1; k >= 0; k--) {
            const factor = matrix[k][i];
            for (let j = 0; j < cols; j++) {
                matrix[k][j] -= factor * matrix[i][j];
            }
        }
    }
}

// Function to swap two rows in a matrix
function swapRows(matrix, row1, row2) {
    let temp = matrix[row1];
    matrix[row1] = matrix[row2];
    matrix[row2] = temp;
}

// Format matrix for displaying the solution
function formatMatrix(matrix) {
    return matrix.map(row => row.join('\t')).join('\n');
}
