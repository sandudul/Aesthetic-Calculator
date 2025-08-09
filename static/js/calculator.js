/**
 * Aesthetic Calculator - Main JavaScript Logic
 * Handles all calculator operations, display updates, and user interactions
 */

class Calculator {
    constructor() {
        // Display elements
        this.displayPrimary = document.getElementById('displayPrimary');
        this.displaySecondary = document.getElementById('displaySecondary');
        
        // Calculator state
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.justCalculated = false;
        
        // Initialize event listeners
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    /**
     * Initialize all event listeners for buttons and keyboard
     */
    initializeEventListeners() {
        // Button event listeners
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
                this.addButtonAnimation(e.target);
            });
        });
        
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Prevent context menu on buttons for better mobile experience
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }
    
    /**
     * Handle button click events
     * @param {HTMLElement} button - The clicked button element
     */
    handleButtonClick(button) {
        const number = button.dataset.number;
        const action = button.dataset.action;
        
        if (number !== undefined) {
            this.inputNumber(number);
        } else if (action) {
            this.handleAction(action);
        }
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyPress(event) {
        const key = event.key;
        
        // Prevent default behavior for calculator keys
        if (/[0-9+\-*/.=]|Enter|Escape|Backspace/.test(key)) {
            event.preventDefault();
        }
        
        // Number keys
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
            this.highlightButton(`[data-number="${key}"]`);
        }
        
        // Operator keys
        switch (key) {
            case '+':
                this.handleAction('add');
                this.highlightButton('[data-action="add"]');
                break;
            case '-':
                this.handleAction('subtract');
                this.highlightButton('[data-action="subtract"]');
                break;
            case '*':
                this.handleAction('multiply');
                this.highlightButton('[data-action="multiply"]');
                break;
            case '/':
                this.handleAction('divide');
                this.highlightButton('[data-action="divide"]');
                break;
            case '.':
                this.handleAction('decimal');
                this.highlightButton('[data-action="decimal"]');
                break;
            case '=':
            case 'Enter':
                this.handleAction('equals');
                this.highlightButton('[data-action="equals"]');
                break;
            case 'Escape':
                this.handleAction('clear-all');
                this.highlightButton('[data-action="clear-all"]');
                break;
            case 'Backspace':
                this.handleAction('backspace');
                this.highlightButton('[data-action="backspace"]');
                break;
            case 'c':
            case 'C':
                this.handleAction('clear');
                this.highlightButton('[data-action="clear"]');
                break;
        }
    }
    
    /**
     * Handle various calculator actions
     * @param {string} action - The action to perform
     */
    handleAction(action) {
        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.handleOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'clear':
                this.clear();
                break;
            case 'clear-all':
                this.clearAll();
                break;
            case 'backspace':
                this.backspace();
                break;
        }
    }
    
    /**
     * Input a number digit
     * @param {string} digit - The digit to input
     */
    inputNumber(digit) {
        if (this.waitingForOperand) {
            this.currentInput = digit;
            this.waitingForOperand = false;
        } else if (this.justCalculated) {
            this.currentInput = digit;
            this.justCalculated = false;
            this.clearSecondaryDisplay();
        } else {
            this.currentInput = this.currentInput === '0' ? digit : this.currentInput + digit;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Input decimal point
     */
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.justCalculated) {
            this.currentInput = '0.';
            this.justCalculated = false;
            this.clearSecondaryDisplay();
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    /**
     * Handle operator input
     * @param {string} nextOperator - The operator to use
     */
    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator && !this.waitingForOperand) {
            const result = this.performCalculation();
            
            if (result === null) return; // Error occurred
            
            this.currentInput = String(result);
            this.previousInput = result;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.justCalculated = false;
        
        this.updateSecondaryDisplay();
        this.updateDisplay();
    }
    
    /**
     * Perform the actual calculation
     * @returns {number|null} The result of the calculation, or null if error
     */
    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return null;
        
        let result;
        
        switch (this.operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return null;
                }
                result = prev / current;
                break;
            default:
                return null;
        }
        
        // Round to prevent floating point precision issues
        return Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    }
    
    /**
     * Calculate and display result
     */
    calculate() {
        if (this.operator && this.previousInput !== '' && !this.waitingForOperand) {
            const result = this.performCalculation();
            
            if (result === null) return; // Error occurred
            
            this.updateSecondaryDisplay(true);
            this.currentInput = String(result);
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = false;
            this.justCalculated = true;
            
            this.updateDisplay();
        }
    }
    
    /**
     * Clear current input
     */
    clear() {
        this.currentInput = '0';
        this.updateDisplay();
    }
    
    /**
     * Clear all calculator state
     */
    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.justCalculated = false;
        this.clearSecondaryDisplay();
        this.updateDisplay();
    }
    
    /**
     * Remove last digit (backspace)
     */
    backspace() {
        if (this.justCalculated) return;
        
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        
        this.updateDisplay();
    }
    
    /**
     * Update the primary display
     */
    updateDisplay() {
        this.displayPrimary.textContent = this.formatNumber(this.currentInput);
        this.displayPrimary.classList.remove('display-error');
    }
    
    /**
     * Update the secondary display to show the operation
     * @param {boolean} showResult - Whether to show the complete calculation
     */
    updateSecondaryDisplay(showResult = false) {
        if (showResult && this.operator && this.previousInput !== '') {
            const operatorSymbol = this.getOperatorSymbol(this.operator);
            this.displaySecondary.textContent = 
                `${this.formatNumber(this.previousInput)} ${operatorSymbol} ${this.formatNumber(this.currentInput)} =`;
        } else if (this.operator && this.previousInput !== '') {
            const operatorSymbol = this.getOperatorSymbol(this.operator);
            this.displaySecondary.textContent = 
                `${this.formatNumber(this.previousInput)} ${operatorSymbol}`;
        }
    }
    
    /**
     * Clear the secondary display
     */
    clearSecondaryDisplay() {
        this.displaySecondary.textContent = '';
    }
    
    /**
     * Get the display symbol for an operator
     * @param {string} operator - The operator name
     * @returns {string} The display symbol
     */
    getOperatorSymbol(operator) {
        switch (operator) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }
    
    /**
     * Format a number for display
     * @param {string|number} num - The number to format
     * @returns {string} The formatted number
     */
    formatNumber(num) {
        const number = parseFloat(num);
        
        if (isNaN(number)) return '0';
        
        // Handle very large or very small numbers
        if (Math.abs(number) >= 1e10 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Format with appropriate decimal places
        return number.toLocaleString('en-US', {
            maximumFractionDigits: 8,
            useGrouping: false
        });
    }
    
    /**
     * Show an error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.displayPrimary.textContent = 'Error';
        this.displayPrimary.classList.add('display-error');
        this.displaySecondary.textContent = message;
        
        // Reset after a delay
        setTimeout(() => {
            this.clearAll();
        }, 2000);
    }
    
    /**
     * Add visual feedback animation to button
     * @param {HTMLElement} button - The button to animate
     */
    addButtonAnimation(button) {
        button.classList.add('btn-active');
        setTimeout(() => {
            button.classList.remove('btn-active');
        }, 200);
    }
    
    /**
     * Highlight a button based on keyboard input
     * @param {string} selector - CSS selector for the button
     */
    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            this.addButtonAnimation(button);
        }
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add subtle floating animation to the calculator
    const calculator = document.querySelector('.calculator');
    if (calculator) {
        calculator.style.animation = 'float 6s ease-in-out infinite';
    }
    
    // Add floating keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
});
