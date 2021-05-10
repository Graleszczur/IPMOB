const alphabet = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10,
    k: 11,
    l: 12,
    m: 13,
    n: 14,
    o: 15,
    p: 16,
    q: 17,
    r: 18,
    s: 19,
    t: 20,
    u: 21,
    v: 22,
    w: 23,
    x: 24,
    y: 25,
    z: 26,
}

onmessage = function (e) {
    let request = JSON.parse(e.data);
    let sum = 0;
    Object.keys(request).forEach(function (key) {
        sum += calculateWordValue(request[key]);
    })
    const R = sum % 255;
    const new_data = {
        R: R,
        G: 255 - (sum % 255),
        B: (0.5 * R > 125) ? 99 : 199
    }
    self.postMessage(JSON.stringify(new_data));

    function calculateWordValue(word) {
        let tempSum = 0;
        let i;
        for (i = 0; i < word.length; ++i) {
            const currentChar = word[i];
            if (alphabet[currentChar]) {
                if (currentChar === currentChar.toLowerCase()) {
                    tempSum += alphabet[currentChar];
                } else {
                    tempSum += alphabet[currentChar] + 30;
                }
            }
        }
        return tempSum;
    }

};