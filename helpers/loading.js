const colors = require('./colors');
let current = 0;
const progress = ['\\', '|', '/', '-'];

function create(text) {
    current = 0;
    const interval = setInterval(() => {
        process.stdout.write(colors.fg.Yellow + '\r' + progress[current++] + ' ' + text);
        current &= 3;
    }, 150);
    return {
        text,
        interval,
        close: (confirmText) => {
            finishLoading(interval, confirmText, text.length - confirmText.length);
        },
        rename: (newName) => {
            return resetInterval(interval, newName, text.length - newName.length);
        },
        next: (newText, oldText = text) => {
            finishLoading(interval, oldText, text.length - oldText.length);
            return create(newText);
        },
        error: (errorText) => {
            finishLoading(interval, errorText, text.length - errorText.length, true);
        }
    };
}

function resetInterval(interval, text, diff) {
    current = 0;
    clearInterval(interval);
    interval = setInterval(() => {
        process.stdout.write(colors.fg.Yellow + '\r' + progress[current++] + ' ' + text + getClearLine(diff));
        current &= 3;
    }, 150);
    return {
        text,
        interval,
        close: (confirmText) => {
            finishLoading(interval, confirmText, text.length - confirmText.length);
        },
        rename: (newName) => {
            return resetInterval(interval, newName, text.length - newName.length);
        },
        next: (newText, oldText = text) => {
            finishLoading(interval, oldText, text.length - oldText.length);
            return create(newText);
        },
        error: (errorText) => {
            finishLoading(interval, errorText, text.length - errorText.length, true);
        }
    };
}

function finishLoading(interval, text, diff, error = false) {
    const symbol = error ? `${colors.Reset}${colors.fg.Red}[x]` : `${colors.Reset}${colors.fg.Green}[✓]`;
    const status = `${symbol}${colors.Reset}${colors.Bright}`;
    process.stdout.write(`\r${status} ${text}${getClearLine(diff - 2)}`);
    console.log(colors.Reset);
    clearInterval(interval);
}

function getClearLine(diff) {
    let clearLine = '';
    for (let i = 0; i < diff; i++) {
        clearLine += ' ';
    }
    return clearLine;
}

module.exports = create;