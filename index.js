(function () {
  var fetch = self.fetch;

  // Those are totally, 100%, non-standard responses
  function response(input, typ) {
    return {
      type: typ,
      url: input.url || input,
      status: -1,
      ok: false,
      statusText: '',
      headers: {}
    }
  }

  function fetched(input, init) {
    var resolve, promises = [];

    // The normal fetch call
    promises.push(fetch(input, init));

    // Handling the eventual timeout by resolving after the time
    if (init && typeof init.timeout === 'number') {
      promises.push(new Promise(function (resolve) {
        setTimeout(function () {
          resolve(response(input, 'timeout'));
        }, init.timeout)
      }));
    }

    // Exposing a cancel method
    promises.push(new Promise(function (res) {
      resolve = res;
    }));

    var result = Promise.race(promises);

    result.cancel = function () {
      resolve(response(input, 'cancel'));
    };

    return result;
  }

  self.fetch = fetched;
})();
