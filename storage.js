/* Async function to set a variable using chrome storage. */
function async_put(key,val) {
    return new Promise(function(resolve, reject) {
        // Save it using the Chrome extension storage API.
        change = {}; 
        change[key] = val;
        chrome.storage.local.set(change, function() {
          // Notify that we saved.
          console.log("Set value for key " + key + " => " + val);
          resolve();
        });
    });
}

/* Async function to get a variable using chrome storage. */
function async_get(key, def={}) {
    return new Promise(function(resolve, reject) {
        // Fetch it using the Chrome extension storage API.
        let query = {};
        query[key] = def;
        chrome.storage.local.get(query, function(objects) {
          resolve(objects[key]);
          console.log("Got value for key '" + key + "': " + objects[key]);
        });
    });
}

function async_get_all(keys) {
    return new Promise(function(resolve, reject) {
        // Fetch it using the Chrome extension storage API.
        chrome.storage.local.get(keys, function(objects) {
          resolve(objects);
        });
    });
}