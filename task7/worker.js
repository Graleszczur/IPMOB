onmessage = function (e) {
    let request = JSON.parse(e.data);
    Object.keys(request).forEach(function (key) {
        request[key] = reverseLetters(request[key]);
    })
    self.postMessage(JSON.stringify(request));

    function reverseLetters(entryString) {
        let resultString = '';
        let counter = 0;
        while (counter < entryString.length) {
            let currentChar = entryString.charAt(counter);
            if (currentChar === currentChar.toUpperCase()) {
                currentChar = currentChar.toLowerCase();
            } else {
                currentChar = currentChar.toUpperCase();
            }
            counter += 1;
            resultString += currentChar;
        }
        return resultString;
    }
};