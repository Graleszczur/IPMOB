
// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

function initDatabase() {
    let request = window.indexedDB.open("MyTestDatabase", 3);
    request.onerror = function (event) {
        console.log("Error occurred during database setup");
    };
    request.onsuccess = function (event) {
        db = event.target.result;
        db.onerror = function (event) {
            console.log("Error has occurred: " + event.target.errorCode);
        };
        updateTableBody();
    };

    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        let objectStore = db.createObjectStore("customers", {keyPath: "id", autoIncrement: true});
        objectStore.createIndex("name", "name", {unique: false});
        objectStore.createIndex("surname", "surname", {unique: false});
        objectStore.createIndex("phoneNumber", "phoneNumber", {unique: true});
        objectStore.createIndex("email", "email", {unique: true});
        objectStore.createIndex("idNumber", "idNumber", {unique: true});
        objectStore.createIndex("address", "address", {unique: false});
        objectStore.createIndex("city", "city", {unique: false});
        objectStore.createIndex("postalCode", "postalCode", {unique: false});
        objectStore.createIndex("image", "image", {unique: false});
        objectStore.transaction.oncomplete = function (event) {
        };
    };

    document.getElementById('addClientForm').onsubmit = function (e) {
        e.preventDefault();
        document.getElementById('useColorWorker').click();
        let customerID = document.getElementById('recordIDinput').value;
        const name = document.getElementById('nameInput').value;
        const surname = document.getElementById('surnameInput').value;
        const phoneNumber = document.getElementById('phoneNumberInput').value;
        const email = document.getElementById('emailInput').value;
        const idNumber = document.getElementById('IDInput').value;
        const address = document.getElementById('addressInput').value;
        const city = document.getElementById('cityInput').value;
        const postalCode = document.getElementById('postalCodeInput').value;

        //Edit?
        if (customerID !== "") {
            customerID = parseInt(customerID);
            let transaction = db.transaction(["customers"], "readwrite");
            transaction.objectStore("customers").get(customerID).onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    const customerEntry = {
                        id: customerID,
                        name: name,
                        surname: surname,
                        phoneNumber: phoneNumber,
                        email: email,
                        idNumber: idNumber,
                        address: address,
                        city: city,
                        postalCode: postalCode
                    }
                    let idToDelete = customerID;
                    let transaction = db.transaction(["customers"], "readwrite");
                    request = transaction.objectStore("customers").delete(idToDelete);
                    transaction = db.transaction(["customers"], "readwrite");
                    transaction.oncomplete = function (event) {
                    };
                    transaction.onerror = function (event) {
                        console.log(event);
                    };
                    let customersObjectStore = transaction.objectStore("customers");
                    request = customersObjectStore.add(customerEntry);
                    request.onsuccess = function (event) {
                        updateTableBody();
                    };
                } else {
                    console.log("ID doest not exist");
                }
            };
        } else {
            let canvas = document.getElementById("myCanvas");
            let canvasImage;
            canvas.toBlob(function(blob){
                canvasImage = blob;
            },'image/jpeg');
            const customerEntry = {
                name: name,
                surname: surname,
                phoneNumber: phoneNumber,
                email: email,
                idNumber: idNumber,
                address: address,
                city: city,
                postalCode: postalCode,
                image: canvasImage
            }
            let transaction = db.transaction(["customers"], "readwrite");
            transaction.oncomplete = function (event) {
            };
            transaction.onerror = function (event) {
                console.log(event);
            };
            let customersObjectStore = transaction.objectStore("customers");
            let request = customersObjectStore.add(customerEntry);
            request.onsuccess = function (event) {
            };
        }
        updateTableBody();
    }

    document.getElementById('searchButton').onclick = function (e) {
        let word = document.getElementById('searchInput').value;
        if (word == null) {
            word = "";
        }
        let words = word.split(' ');
        document.getElementById("customers-table-body").innerHTML = "";
        const request = db.transaction("customers").objectStore("customers").openCursor();
        request.onerror = function (event) {
            console.log(event);
        };
        request.onsuccess = function (event) {
            cursor = event.target.result;

            if (cursor) {
                let url = window.URL || window.webkitURL;
                let binaryData = [];
                binaryData.push(cursor.value.image);
                let imageSrc = url.createObjectURL(new Blob(binaryData, {type: 'image/jpeg'}));
                words.forEach(function (keyword) {
                    if ((
                        cursor.value.name.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.surname.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.phoneNumber.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.email.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.idNumber.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.address.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.city.toLowerCase().includes(keyword.toLowerCase()) ||
                        cursor.value.postalCode.toLowerCase().includes(keyword.toLowerCase()))) {
                        document.getElementById("customers-table-body").innerHTML +=
                            "<tr><td>" + cursor.key + "</td><td>"
                            + cursor.value.name + "</td><td>"
                            + cursor.value.surname + "</td><td>"
                            + cursor.value.phoneNumber + "</td><td>"
                            + cursor.value.email + "</td><td>"
                            + cursor.value.idNumber + "</td><td>"
                            + cursor.value.address + "</td><td>"
                            + cursor.value.city + "</td><td>"
                            + cursor.value.postalCode
                            + "</td><td><button id=\"delButton\" value=\"" + cursor.key + "\">Usuń</button>"
                            + "</td><td><image src=\"" + imageSrc+ "\" style='height: 50px; width: 50px;'></image>"
                            + "</td></tr>";
                        document.getElementById('delButton').onclick = function (e) {
                            let idToDelete = parseInt(document.getElementById('delButton').value);
                            let request = db.transaction(["customers"], "readwrite").objectStore("customers").delete(idToDelete);
                            document.getElementById('searchInput').value = "";
                            updateTableBody();
                        }
                    }
                    cursor.continue();
                });

            }
        };
    }

    function randomString(arr) {
        let randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    document.getElementById('generateButton').onclick = function (e) {
        document.getElementById("nameInput").value = randomString(['Bartosz', 'Maciej', 'Jan', 'Paweł']);
        document.getElementById("surnameInput").value = randomString(['Kowalski', 'Nowak', 'Cichy', 'Wawelski']);
        document.getElementById("emailInput").value = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5) + '@gmail.com';
        document.getElementById("addressInput").value = randomString(['Wilcza 2', "Piłsudzkiego 12", "Wolskiego 4", "Pabianicka 144"]);
        document.getElementById("cityInput").value = randomString(['Warszawa', 'Kraków', 'Łódź', 'Wrocław']);
        document.getElementById("postalCodeInput").value = (Math.floor(Math.random() * 89 + 10) + '-' + Math.floor(Math.random() * 899 + 100)).toString();
        document.getElementById("phoneNumberInput").value = Math.floor(Math.random() * 899 + 100).toString() + Math.floor(Math.random() * 899 + 100).toString() + Math.floor(Math.random() * 899 + 100).toString();
        document.getElementById("IDInput").value = randomString(['ABC123456', 'BCA123456', 'AAA123456', 'BBB123456', 'AWC123456', 'ACC123456', 'AFG123456', 'AFH123456',
            'ADG123456', 'WQQ123456']);
    }
    document.getElementById('useWorker').onclick = function (event) {
        const worker = new Worker('worker.js');
        const name = document.getElementById('nameInput').value;
        const surname = document.getElementById('surnameInput').value;
        const phoneNumber = document.getElementById('phoneNumberInput').value;
        const email = document.getElementById('emailInput').value;
        const idNumber = document.getElementById('IDInput').value;
        const address = document.getElementById('addressInput').value;
        const city = document.getElementById('cityInput').value;
        const postalCode = document.getElementById('postalCodeInput').value;
        const entry = {
            name: name,
            surname: surname,
            phoneNumber: phoneNumber,
            email: email,
            idNumber: idNumber,
            address: address,
            city: city,
            postalCode: postalCode
        }
        worker.postMessage(JSON.stringify(entry));
        worker.addEventListener('message', handleMessage);
    }

    function handleMessage(e) {
        let result = JSON.parse(e.data);
        document.getElementById("nameInput").value = result['name'];
        document.getElementById("surnameInput").value = result['surname'];
        document.getElementById("emailInput").value = result['email'];
        document.getElementById("addressInput").value = result['address'];
        document.getElementById("cityInput").value = result['city'];
        document.getElementById("postalCodeInput").value = result['postal'];
        document.getElementById("phoneNumberInput").value = result['phone'];
        document.getElementById("IDInput").value = result['id_card'];
    }

    document.getElementById('useColorWorker').onclick = function triggerColorFilter(e) {
        const entry = {
            name: document.getElementById('nameInput').value,
            surname: document.getElementById('surnameInput').value,
            phoneNumber: document.getElementById('phoneNumberInput').value,
            email: document.getElementById('emailInput').value,
            idNumber: document.getElementById('IDInput').value,
            address: document.getElementById('addressInput').value,
            city: document.getElementById('cityInput').value,
            postalCode: document.getElementById('postalCodeInput').value
        }
        const worker = new Worker('colorFilterWorker.js');
        worker.postMessage(JSON.stringify(entry));
        worker.addEventListener('message', handleColorFilterMessage);
    }

    function handleColorFilterMessage(e) {
        let result = JSON.parse(e.data);
        let imageURL = document.getElementById('filterImage').value;
        let canvas = document.getElementById('myCanvas');
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let image = new Image();
        image.src = imageURL;
        image.onload = function() {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgb(' + result.R +
                "," + result.G + "," + result.B + ", 0.50)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

    }


    function updateTableBody() {
        document.getElementById("customers-table-body").innerHTML = "";
        let request = db.transaction("customers").objectStore("customers").openCursor();
        request.onerror = function (event) {
            console.log(event);
        };
        request.onsuccess = function (event) {
            cursor = event.target.result;

            if (cursor) {
                let url = window.URL || window.webkitURL;
                let binaryData = [];
                binaryData.push(cursor.value.image);
                let imageSrc = url.createObjectURL(new Blob(binaryData, {type: 'image/jpeg'}));
                document.getElementById("customers-table-body").innerHTML +=
                    "<tr><td>" + cursor.key + "</td><td>"
                    + cursor.value.name + "</td><td>"
                    + cursor.value.surname + "</td><td>"
                    + cursor.value.phoneNumber + "</td><td>"
                    + cursor.value.email + "</td><td>"
                    + cursor.value.idNumber + "</td><td>"
                    + cursor.value.address + "</td><td>"
                    + cursor.value.city + "</td><td>"
                    + cursor.value.postalCode
                    + "</td><td><button id=\"delButton\" value=\"" + cursor.key + "\">Usuń</button>"
                    + "</td><td><image src=\"" + imageSrc+ "\" style='height: 50px; width: 50px;'></image>"
                    + "</td></tr>";
                document.getElementById('delButton').onclick = function (e) {
                    let idToDelete = parseInt(document.getElementById('delButton').value);
                    let request = db.transaction(["customers"], "readwrite").objectStore("customers").delete(idToDelete);
                    document.getElementById('searchInput').value = "";
                    updateTableBody();
                }
            }
            cursor.continue();
        }
    }
}