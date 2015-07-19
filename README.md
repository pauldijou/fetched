# fetched

[fetch](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch) is the new API to make HTTP requests, the support isn't [all that awesome](http://caniuse.com/#search=fetch) but you have at least [one nice polyfill](https://github.com/github/fetch) so we can use it right now!

This API has all you would expect except for one thing: you cannot cancel a request. Unlike `xhr` which has an `abort` method, there is nothing similar with `fetch` which is problematic for one common use case: an autocomplete search field where you trigger a new request every time the user enter new content and obviously cancel the previous one if it's still running. This lib aims to add a way to cancel a fetch request.

## Install

```
npm install fetched
bower install fetched
jspm install npm:fetched
```

If you want to use with Node, read the [section dedicated to it](#node).

## Usage

You will need to have both `fetch` and `Promise` already present or polyfilled. You can use [GitHub fetch polyfill](https://github.com/github/fetch) and there are dozen of [Promise polyfills](https://www.google.fr/search?q=promise%20polyfill).

### Cancel

```javascript
var fetched = fetch('/users.json');

// See the 'Limitations' section to understand why
// we are not chaining directly
fetched.then(function (response) {
  if (response.ok) {
    return response.json();
  }
});

fetched.cancel();
```

### Timeout

```javascript
var fetched = fetch('/users.json', {timeout: 5000})
  .then(function (response) {
    if (response.ok) {
      return response.json();
    }
  });
```

## Limitations

**Important**, please read this section to fully understand how this lib works and its limitations.

One might think that when calling `cancel` or when the timeout occurs, all the following `then` after the initial `fetch` will not be called. That's not the case (but I would love if it was like that). It will just return a different response.

```javascript
response.ok === false
response.status === -1
response.statusText === ''
// Cancel
response.type === 'cancel'
// Timeout
response.type === 'timeout'
```

Those are non-standard types, and truth to be told, a bit ugly. So why not just preventing all the `then`? To do so, we would need to cancel the `Promise` returned by `fetch` itself and, trust me, there is no easy way to cancel a `Promise` right now. It would imply having something like a proxy to store all the `then` and `catch` calls, and only call them if the `Promise` isn't canceled. And even so, there are still a lot of pending questions. It's doable, you can read this [super long issue](https://github.com/whatwg/fetch/issues/27) about that topic or check a [working proof of concept](https://gist.github.com/WebReflection/0ca8fac8013f76fb4d06).

But I didn't want to dive into stuff that complex, I just wanted a way to easily handle a canceled fetch. That's why I choose to return custom responses and let the final user (== you) handle them. Sure, it's more verbose, but the code is dead simple. The main drawback is that you need to assign the result of the `fetch` **before** doing any chaining with `then` or `catch`. Any call to those functions will create a new `Promise` that doesn't have any `cancel` function.

Again, this lib can only cancel or timeout the fetch call itself, not all the promises. That's the trade-off to keep it simple. Some people might think it's not useful enough for them and that's ok, but it gets the job done and that's all I wanted.

## Autocomplete example

It's for that one use-case that I needed such lib.

```html
<input id="search" type="text">

<script type="text/javascript">
  var request, search = document.getElementById('search');

  search.addEventListener('input', function () {
    if (request) {
      request.cancel();
    }

    // Do not chain a `then` directly or you will create a new promise
    // and hide the `cancel` method.
    request = fetch('/search?q=' + encodeURIComponent(search.value));

    // Now that the variable is assigned, we can freely chain
    request.then(function (response) {
      if (response.ok) {
        // Display the results
      } else if (response.type === 'error') {
        // Warn the user about a network error
      } else if (response.status === 401) {
        // Ask for login
      }
      // ... as many rules as needed
    });
  });
</script>
```

## Node

TODO

## License

This software is licensed under the Apache 2 license, quoted below.

Copyright 2015 Paul Dijou ([http://pauldijou.fr](http://pauldijou.fr)).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
